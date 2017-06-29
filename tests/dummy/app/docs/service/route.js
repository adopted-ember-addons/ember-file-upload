import Ember from 'ember';

export default Ember.Route.extend({
  model(params) {
    return this.modelFor('docs').services.findBy('name', params.id);
  }
});
