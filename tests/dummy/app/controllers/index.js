import Ember from 'ember';

export default Ember.Controller.extend({
  actions: {
    uploadImage: function (file) {
      if (this.get('events') == null) {
        this.set('events', Ember.A([]));
      }

      return file.upload('/photos/new').then(({ body: { filename, url } }) => {
        this.get('events').pushObject({
          filename,
          preview: url
        });
      }, function () {});
    }
  }
});
