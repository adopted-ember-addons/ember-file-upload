import BaseUploader from 'ember-file-upload/uploaders/base';
import get from 'ember-metal/get';

/**
  FormDataUploader

  @class FormDataUploader
  @extends Ember.Object
 */
export default BaseUploader.extend({

  defaultOptions: {
    method: 'POST',
    headers: {
      accepts: 'application/json,text/javascript'
    },
    data: {},
    fileKey: 'file',
    withCredentials: false
  },

  normalizeOptions(file, url, options) {
    options = this._super(...arguments);

    if (!options.hasOwnProperty('contentType')) {
      options.contentType = get(file, 'type');
    }

    // Set Content-Type in the data payload
    // instead of the headers, since the header
    // for Content-Type will always be multipart/form-data
    if (options.contentType) {
      options.data['Content-Type'] = options.contentType;
    }

    options.data[options.fileKey] = file.blob;

    return options;
  },

  createData(file, url, options) {
    let form = new FormData();

    Object.keys(options.data).forEach((key) => {
      if (key === options.fileKey) {
        form.append(key, options.data[key], get(file, 'name'));
      } else {
        form.append(key, options.data[key]);
      }
    });

    return form;
  }

});
