/* global atob */
import Ember from 'ember';
import FileReader from './system/file-reader';
import HTTPRequest from './system/http-request';
import uuid from './system/uuid';

const { get, set } = Ember;
const { reads } = Ember.computed;

function normalizeOptions(file, url, options) {
  if (typeof url === 'object') {
    options = url;
    url = null;
  }

  options = options || {};

  options.url = options.url || url;
  options.method = options.method || 'POST';
  options.accepts = options.accepts || ['application/json', 'text/javascript'];
  options.contentType = options.contentType || get(file, 'type');
  options.headers = options.headers || {};
  options.data = options.data || {};
  options.fileKey = options.fileKey || 'file';

  if (options.headers.Accept == null) {
    if (!Array.isArray(options.accepts)) {
      options.accepts = [options.accepts];
    }
    options.headers.Accept = options.accepts.join(',');
  }

  // Set Content-Type in the data payload
  // instead of the headers, since the header
  // for Content-Type will always be multipart/form-data
  if (options.contentType) {
    options.data['Content-Type'] = options.contentType;
  }

  options.data[options.fileKey] = file.blob;

  return options;
}

let File = Ember.Object.extend({

  init() {
    this._super();
    Object.defineProperty(this, 'id', {
      writeable: false,
      enumerable: true,
      value: `file-${uuid()}`
    });
  },

  id: null,

  name: reads('blob.name'),

  size: reads('blob.size'),

  type: reads('blob.type'),

  loaded: null,

  progress: null,

  upload(url, opts) {
    let options = normalizeOptions(this, url, opts);

    // Build the form
    let form = new FormData();

    Object.keys(options.data).forEach(function (key) {
      form.append(key, options.data[key]);
    });

    let request = new HTTPRequest();
    Object.keys(options.headers).forEach(function (key) {
      request.setRequestHeader(key, options.headers[key]);
    });
    request.open(options.method, options.url);

    if (options.timeout) {
      request.timeout = options.timeout;
    }

    request.onprogress = (evt) => {
      if (evt.lengthComputable) {
        set(this, 'loaded', evt.loaded);
        set(this, 'size', evt.total);
        set(this, 'progress', (evt.loaded / evt.total) * 100);
      }
    };

    return request.send(form);
  },

  read(options={ as: 'data-url' }) {
    let reader = new FileReader();

    let blob = this.blob;
    switch (options.as) {
    case 'array-buffer':
      return reader.readAsArrayBuffer(blob);
    case 'data-url':
      return reader.readAsDataURL(blob);
    case 'binary-string':
      return reader.readAsBinaryString(blob);
    case 'text':
      return reader.readAsText(blob);
    }
  },

  remove() {
    this.queue.removeObject(this);
  }

});

File.reopenClass({

  /**
    Creates a file object that can be read or uploaded to a
    server from a Blob object.

    @method fromBlob
    @param {Blob} blob The blob to create the file from.
    @return {File} A file object
   */
  fromBlob(blob) {
    let file = File.create();
    Object.defineProperty(file, 'blob', {
      writeable: false,
      enumerable: false,
      value: blob
    });

    return file;
  },

  fromDataURL(dataURL) {
    let [typeInfo, base64String] = dataURL.split(',');
    let mimeType = typeInfo.match(/:(.*?);/)[1];

    let binaryString = atob(base64String);
    let binaryData = new Uint8Array(binaryString.length);

    for (let i = 0, len = binaryString.length; i < len; i++) {
      binaryData[i] = binaryString.charCodeAt(i);
    }

    let blob = new Blob([binaryData], { type: mimeType });

    return this.fromBlob(blob);
  }
});

export default File;
