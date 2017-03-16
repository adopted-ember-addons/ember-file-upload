import Ember from 'ember';

const { computed, get } = Ember;

export default Ember.Controller.extend({
  ships: computed('model.[]', {
    get() {
      return get(this, 'model').slice(-5);
    }
  })
});
