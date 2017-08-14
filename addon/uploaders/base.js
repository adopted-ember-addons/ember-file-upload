import Ember from 'ember';
import HTTPRequest from 'ember-file-upload/system/http-request';
import RSVP from 'rsvp';

import set from 'ember-metal/set';

const { assign } = Ember;

/**
  BaseUploader

  @class BaseUploader
  @extends Ember.Object
 */
export default Ember.Object.extend({

  defaultOptions: {
    method: 'POST',
    headers: {},
    withCredentials: false
  },

  upload(file, url, options) {
    if (['queued', 'failed', 'timed_out'].indexOf(file.get('state')) === -1) {
      Ember.assert(`The file ${file.get('id')} is in the state "${file.get('state')}" and cannot be requeued.`);
    }

    options = this.normalizeOptions(file, url, options);
    let request = this._createRequest(file, url, options);

    file.updateState('uploading');

    // Increment for Ember.Test
    // inflightRequests++;

    let data = this.createData(file, url, options);

    return request.send(data).then((result) => {
      file.updateState('uploaded');
      return result;
    }).catch((error) => {
      file.updateState('failed');
      return RSVP.reject(error);
    }).finally(() => {
      // Decrement for Ember.Test
      // inflightRequests--;
    });
  },

  normalizeOptions(file, url, options) {
    if (typeof url === 'object') {
      options = url;
      url = null;
    }

    options.url = options.url || url;

    // Override default options with passed in options
    let defaultOptions = this.get('defaultOptions');
    options = assign({}, defaultOptions, options);
    options.headers = assign({}, defaultOptions.headers, options.headers);

    return options;
  },

  createData(file) {
    return file.get('blob');
  },

  _createRequest(file, url, options) {
    let request = new HTTPRequest({
      withCredentials: options.withCredentials,
      label: `${options.method} ${file.get('name')} to ${options.url}`
    });

    request.open(options.method, options.url);

    Object.keys(options.headers).forEach((key) => {
      request.setRequestHeader(key, options.headers[key]);
    });

    if (options.timeout) {
      request.timeout = options.timeout;
    }

    this._createEventHandlers(request, file);

    return request;
  },

  _createEventHandlers(request, file) {
    request.onprogress = function (evt) {
      if (evt.lengthComputable) {
        set(file, 'loaded', evt.loaded);
        set(file, 'size', evt.total);
        set(file, 'progress', (evt.loaded / evt.total) * 100);
      }
    };

    request.ontimeout = function () {
      file.updateState('timed_out');
    };

    request.onabort = function () {
      file.updateState('aborted');
    };
  }

});
