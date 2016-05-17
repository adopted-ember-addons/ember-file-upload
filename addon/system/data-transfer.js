import Ember from 'ember';
import trim from './trim';

const { get, computed } = Ember;

export default Ember.Object.extend({

  dataTransfer: null,

  queue: null,

  valid: computed('dataTransfer.files', 'files', {
    get() {
      return get(this, 'dataTransfer.files.length') !== get(this, 'files.length');
    }
  }),

  files: computed('queue.multiple', 'queue.accept', {
    get() {
      let fileList = get(this, 'dataTransfer.files');
      let files = [];
      if (!get(this, 'multiple') && fileList.length > 1) {
        files.push(fileList[0]);
      } else {
        for (let i = 0, len = fileList.length; i < len; i++) {
          files.push(fileList[i]);
        }
      }

      let tokens = get(this, 'queue.accepts').split(',').map(function (token) {
        return trim(token).toLowerCase();
      });
      let extensions = tokens.filter(function (token) {
        return token.indexOf('.') === 0;
      });
      let mimeTypes = tokens.filter(function (token) {
        return token.indexOf('.') !== 0;
      });

      return files.filter(function (file) {
        let extension = file.name.toLowerCase().match(/(\.[^.]+)$/)[1];
        return mimeTypes.indexOf(file.type.toLowerCase()) !== -1 ||
               extensions.indexOf(extension) !== -1;
      });
    }
  })

});
