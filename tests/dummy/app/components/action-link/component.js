import Ember from 'ember';
import layout from './template';

const RETURN = 13;

export default Ember.Component.extend({

  layout,

  tagName: 'a',
  classNames: ['action-link'],
  tabindex: 0,

  attributeBindings: ['disabled', 'tabindex'],

  click() {
    this.attrs.action();
  },

  keyUp(evt) {
    let code = evt.keyCode || evt.which;
    switch (code) {
    case RETURN:
      this.attrs.action();
    }
  }
});
