import Ember from 'ember';
import trim from './trim';

const { get, computed } = Ember;

export default Ember.Object.extend({

  dataTransfer: null,

  queue: null,

  valid: computed('dataTransfer.files', 'files', {
    get() {
      if (get(this, 'files') == null) {
        return true;
      }

      return (
        get(this, 'dataTransfer.items.length') ||
        get(this, 'dataTransfer.files.length')
      ) === get(this, 'files.length');
    }
  }),

  files: computed('queue.multiple', 'queue.accept', 'dataTransfer', {
    get() {
      let fileList = get(this, 'dataTransfer.files');
      let itemList = get(this, 'dataTransfer.items');

      if ((fileList == null && itemList) ||
          (itemList != null && fileList != null &&
           itemList.length > fileList.length)) {
        fileList = itemList;
      }

      if (fileList == null) {
        return null;
      }

      let files = Ember.A();
      if (!get(this, 'queue.multiple') && fileList.length > 1) {
        files.push(fileList[0]);
      } else {
        for (let i = 0, len = fileList.length; i < len; i++) {
          files.push(fileList[i]);
        }
      }

      let accept = get(this, 'queue.accept');
      if (accept == null) {
        return files;
      }

      let tokens = Ember.A(accept.split(',').map(function (token) {
        return trim(token).toLowerCase();
      }));
      let extensions = Ember.A(tokens.filter(function (token) {
        return token.indexOf('.') === 0;
      }));
      let mimeTypes = Ember.A(Ember.A(tokens.filter(function (token) {
        return token.indexOf('.') !== 0;
      })).map(function (mimeType) {
        return new RegExp(mimeType);
      }));

      return files.filter(function (file) {
        let extension = null;
        if (file.name && /(\.[^.]+)$/.test(file.name)) {
          extension = file.name.toLowerCase().match(/(\.[^.]+)$/)[1];
        }

        let type = file.type.toLowerCase();
        return mimeTypes.find(function (mimeType) {
          return mimeType.test(type);
        }) || extensions.indexOf(extension) !== -1;
      });
    }
  })
});
