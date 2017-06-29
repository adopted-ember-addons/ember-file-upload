import Ember from 'ember';

export default Ember.Route.extend({
  model(params) {
    return this.modelFor('docs').components.findBy('name', params.id);
  }
});
