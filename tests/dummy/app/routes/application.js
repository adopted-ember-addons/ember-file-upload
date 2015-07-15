import Ember from 'ember';

export default Ember.Route.extend({
  actions: {
    uploadImage: function (file) {
      let controller = this.controller;
      if (controller.get('events') == null) {
        controller.set('events', Ember.A([]));
      }

      let filename = file.get('name');
      file.read().then(function (url) {
        controller.get('events').pushObject({
          filename: filename,
          preview: url
        });
      }, function () {});

      file.destroy();
    }
  }
});
