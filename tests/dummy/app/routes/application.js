import Ember from "ember";

export default Ember.Route.extend({
  actions: {
    uploadImage: function (file) {
      let controller = this.controller;
      if (controller.get('events') == null) {
        controller.set('events', Ember.A([]));
      }
      controller.get('events').pushObject(`Queued ${file.get('name')}`);
      file.destroy();
    }
  }
});
