/* global atob */
import Ember from 'ember';
import FileReader from './system/file-reader';
import HTTPRequest from './system/http-request';
import uuid from './system/uuid';

const { get, set, RSVP } = Ember;
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

export default Ember.Object.extend({

  init() {
    this._super();
    Object.defineProperty(this, 'id', {
      writeable: false,
      enumerable: true,
      value: `file-${uuid()}`
    });
  },

  /**
    A unique id generated for this file.

    @property
    @type {String}
    @readonly
   */
  id: null,

  /**
    The file name.

    @property name
    @type {String}
   */
  name: reads('blob.name'),

  /**
    The size of the file in bytes.

    @property size
    @type {Number}
    @readonly
   */
  size: reads('blob.size'),

  /**
    The MIME type of the file.

    For a image file this may be `image/png`.

    @property type
    @type {String}
    @readonly
   */
  type: reads('blob.type'),

  /**
    @property loaded
    @type {Number}
    @default 0
    @readonly
   */
  loaded: 0,

  /**
    @property progress
    @type {Number}
    @default 0
    @readonly
   */
  progress: 0,

  /**
    The current state that the file is in.
    One of:

    - `queued`
    - `uploading`
    - `timed_out`
    - `aborted`
    - `uploaded`
    - `failed`

    @property state
    @type {String}
    @default 'queued'
    @readonly
   */
  state: 'queued',

  upload(url, opts) {
    if (['queued', 'failed', 'timed_out'].indexOf(get(this, 'state')) === -1) {
      Ember.assert(`The file ${this.id} is in the state "${get(this, 'state')}" and cannot be requeued.`);
    }

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

    request.ontimeout = () => {
      set(this, 'state', 'timed_out');
    };

    request.onabort = () => {
      set(this, 'state', 'aborted');
    };

    set(this, 'state', 'uploading');

    return request.send(form).then((result) => {
      set(this, 'state', 'uploaded');
      return result;
    }, (error) => {
      set(this, 'state', 'failed');
      return RSVP.reject(error);
    });
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
  }
}).reopenClass({

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
