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

  invalidFiles: computed('dataTransfer.files', {
    get() {
      let files = get(this, 'files');
      let allFiles = [...get(this, 'dataTransfer.files')];

      return allFiles.filter((file) => !files.includes(file));
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
      let mimeTypeTests = A(A(tokens.filter(function (token) {
        return token.indexOf('.') !== 0;
      })).map(function (mimeType) {
        return function(type) {
          if (A([ 'audio/*', 'video/*', 'image/*' ]).includes(mimeType)) {
            return type.split('/')[0] === mimeType.split('/')[0];
          } else {
            return type === mimeType;
          }
        };
      }));

      return files.filter(function (file) {
        // first check if the mime type matches
        let matchesMimeType = mimeTypeTests.find(function (mimeTypeTest) {
          let type = file.type.toLowerCase();
          return mimeTypeTest(type);
        });

        // next check if the extensions match
        let matchesFileName;

        if (!file.name && extensions.length) {
          // this is likely a situation where a drop event doesn't have a filename
          // due to security reasons in the browser. We cannot determine if the
          // file is valid so we have to assume it matches the filename check
          // for now
          matchesFileName = true;
        } else if (extensions.length) {
          let extension = null;
          if (/(\.[^.]+)$/.test(file.name)) {
            extension = file.name.toLowerCase().match(/(\.[^.]+)$/)[1];
          }

          matchesFileName = extensions.indexOf(extension) !== -1;
        }

        return matchesMimeType || matchesFileName;
      });
    }
  })
});
