import Ember from 'ember';

export default Ember.Route.extend({
  model(params) {
    return this.modelFor('docs').helpers.findBy('name', params.id);
  }
});
