import Ember from "ember";

export default Ember.Route.extend({
  model: function () {
    return {
      title: 'Blërg',
      post: {
        title: 'In the kitchen'
      }
    };
  }
});
