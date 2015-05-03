import Ember from "ember";
import readFileAsDataURL from "../utils/read-file-as-data-url";

export default Ember.Route.extend({
  actions: {
    uploadImage: function (file) {
      let controller = this.controller;
      if (controller.get('events') == null) {
        controller.set('events', Ember.A([]));
      }
      let filename = file.get('name');
      readFileAsDataURL(file.get('file')).then(function (url) {
        controller.get('events').pushObject({
          filename: filename,
          preview: url
        });
      });

      file.destroy();
    }
  }
});
