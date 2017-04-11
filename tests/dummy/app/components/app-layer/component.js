import Ember from 'ember';

const { get, set } = Ember;

export default Ember.Component.extend({
  classNames: ['app-layer'],
  classNameBindings: ['active:active'],

  init() {
    this._super();
    this.updateToken();
  },

  updateToken(diff={}) {
    let token = Ember.merge({
      id: get(this, 'elementId'),
      title: get(this, 'title') || ' ',
      replace: get(this, 'replace'),
      separator: get(this, 'separator'),
      prepend: get(this, 'prepend'),
      component: this,
      active: get(this, 'active')
    }, diff);

    let sanitized = Object.keys(token).reduce(function (E, key) {
      if (token[key]) {
        E[key] = token[key];
      }
      return E;
    }, {});

    get(this, 'app.tokenList').push(sanitized);
  },

  didInsertElement() {
    Ember.run.scheduleOnce('afterRender', () => {
      if (!get(this, 'title')) { return; }
      this.updateToken();
    });
  },

  titleDidChange: Ember.observer('title', function () {
    this.updateToken();
    Ember.run.scheduleOnce('afterRender', () => {
      get(this, 'app').titleDidChange();
    });
  }),

  click() {
    if (get(this, 'active')) {
      set(this, 'active', false);
      this.updateToken();
    } else {
      get(this, 'app.tokenList.tokens').setEach('active', false);
      let components = get(this, 'app.tokenList.tokens').getEach('component');
      Ember.A(components).setEach('active', false);
      set(this, 'active', true);
      this.updateToken();
    }
    return false;
  }
});
