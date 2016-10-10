import Ember from 'ember';
import File from 'ember-file-upload/file';

export default Ember.Controller.extend({
  actions: {
    uploadImage: function (file) {
      if (this.get('events') == null) {
        this.set('events', Ember.A([]));
      }

      let filename = file.get('name');
      file.read().then((url) => {
        this.get('events').pushObject({
          filename: filename,
          preview: url
        });
      }, function () {});
    }
  }
});
