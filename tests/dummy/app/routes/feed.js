import Ember from "ember";

const { capitalize } = Ember.String;

export default Ember.Route.extend({
  model: function (params) {
    return {
      name: capitalize(params.name),
      handle: `@${params.name}`
    };
  }
});
