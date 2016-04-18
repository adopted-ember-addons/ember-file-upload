import Ember from 'ember';
import File from 'ember-file-upload/file';

export default Ember.Controller.extend({
  generatedFile() {
    let file = File.fromDataURL('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAQAAAAECAYAAACp8Z5+AAAABGdBTUEAALGPC/xhBQAAACdJREFUCB1j/G/B8J8BCBiPM4IoBiYwiUQw/v/HDFbh7PQHLIyhAgBB9QeGS+Jv8wAAAABJRU5ErkJggg==');
    file.read().then((url) => {
      this.get('events').pushObject({
        filename: 'Generated for YOU!',
        preview: url
      });
    });
  },

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

      file.remove();
      this.generatedFile();
    }
  }
});
