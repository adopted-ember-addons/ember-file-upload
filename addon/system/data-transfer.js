import { A } from '@ember/array';
import EmberObject, { computed, get } from '@ember/object';
import trim from './trim';

const getDataSupport = {};

export default EmberObject.extend({

  dataTransfer: null,
  itemDetails: null,

  queue: null,

  getData(type) {
    let dataTransfer = get(this, 'dataTransfer');
    if (getDataSupport[type] == null) {
      try {
        let data = dataTransfer.getData(type);
        getDataSupport[type] = true;
        return data;
      } catch (e) {
        getDataSupport[type] = false;
      }
    } else if (getDataSupport[type]) {
      return dataTransfer.getData(type);
    }
  },

  valid: computed('dataTransfer.files', 'files', 'itemDetails', {
    get() {
      if (get(this, 'files') == null) {
        return true;
      }

      return (
        get(this, 'dataTransfer.items.length') ||
        get(this, 'dataTransfer.files.length') ||
        get(this, 'itemDetails.length')
      ) === get(this, 'files.length');
    }
  }),

  files: computed('queue.{accept,multiple}', 'dataTransfer', 'itemDetails', {
    get() {
      let fileList = get(this, 'dataTransfer.files');
      let itemList = get(this, 'dataTransfer.items');
      let itemDetails = get(this, 'itemDetails');

      if ((fileList == null && itemList) ||
          (itemList != null && fileList != null &&
           itemList.length > fileList.length)) {
        fileList = itemList;
      }

      if ((fileList == null && itemDetails) ||
          (itemDetails != null && fileList != null &&
           itemDetails.length > fileList.length)) {
        fileList = itemDetails;
      }

      if (fileList == null) {
        return null;
      }

      let files = A();
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

      let tokens = A(accept.split(',').map(function (token) {
        return trim(token).toLowerCase();
      }));
      let extensions = A(tokens.filter(function (token) {
        return token.indexOf('.') === 0;
      }));
      let mimeTypes = A(A(tokens.filter(function (token) {
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
