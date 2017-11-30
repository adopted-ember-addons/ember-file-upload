/* global atob, Uint8Array */
import Ember from 'ember';
import FileReader from './system/file-reader';
import HTTPRequest from './system/http-request';
import RSVP from 'rsvp';
import uuid from './system/uuid';

const { computed, get, set } = Ember;
const { reads } = computed;

function normalizeOptions(file, url, options) {
  if (typeof url === 'object') {
    options = url;
    url = null;
  }

  options = options || {};

  options.url = options.url || url;
  options.method = options.method || 'POST';
  options.accepts = options.accepts || ['application/json', 'text/javascript'];
  if (!options.hasOwnProperty('contentType')) {
    options.contentType = get(file, 'type');
  }
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

  options.withCredentials = options.withCredentials || false;

  return options;
}

function upload(file, url, opts, uploadFn) {
  if (['queued', 'failed', 'timed_out'].indexOf(get(file, 'state')) === -1) {
    Ember.assert(`The file ${file.id} is in the state "${get(file, 'state')}" and cannot be requeued.`);
  }

  let options = normalizeOptions(file, url, opts);

  let request = new HTTPRequest({
    withCredentials: options.withCredentials,
    label: `${options.method} ${get(file, 'name') } to ${options.url}`
  });

  request.open(options.method, options.url);

  Object.keys(options.headers).forEach(function (key) {
    request.setRequestHeader(key, options.headers[key]);
  });

  if (options.timeout) {
    request.timeout = options.timeout;
  }

  request.onprogress = function (evt) {
    if (evt.lengthComputable) {
      set(file, 'loaded', evt.loaded);
      set(file, 'size', evt.total);
      set(file, 'progress', (evt.loaded / evt.total) * 100);
    }
  };

  request.ontimeout = function () {
    set(file, 'state', 'timed_out');
  };

  request.onabort = function () {
    set(file, 'state', 'aborted');
  };

  set(file, 'state', 'uploading');

  // Increment for Ember.Test
  inflightRequests++;

  let uploadPromise = uploadFn(request, options);

  uploadPromise = uploadPromise.then(function (result) {
    set(file, 'state', 'uploaded');
    return result;
  }, function (error) {
    set(file, 'state', 'failed');
    return RSVP.reject(error);
  }).finally(function () {
    // Decrement for Ember.Test
    inflightRequests--;
  });

  return uploadPromise;
}

let inflightRequests = 0;
if (Ember.Test) {
  Ember.Test.registerWaiter(null, function () {
    return inflightRequests === 0;
  });
}

/**
  Files provide a uniform interface for interacting
  with data that can be uploaded or read.

  @class File
  @extends Ember.Object
 */
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
  name: computed({
    get() {
      return get(this, 'blob.name');
    },
    set(_, name) {
      return name;
    }
  }),

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
    Returns the appropriate file extension of
    the file according to the type

    @property extension
    @type {String}
    @readonly
   */
  extension: computed('type', {
    get() {
      return get(this, 'type').split('/').slice(-1)[0];
    }
  }),

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

  /**
    The source of the file. This is useful
    for applications that want to gather
    analytics about how users upload their
    content.

    This property can be one of the following:

    - `browse`
    - `drag-and-drop`
    - `web`
    - `data-url`
    - `blob`

    `browse` is the source when the file is created
    using the native file picker.

    `drag-and-drop` is the source when the file was
    created using drag and drop from their desktop.

    `web` is the source when the file was created
    by dragging the file from another webpage.

    `data-url` is the source when the file is created
    from a data URL using the `fromDataURL` method for
    files. This usually means that the file was created
    manually by the developer on behalf of the user.

    `blob` is the source when the file is created
    from a blob using the `fromBlob` method for
    files. This usually means that the file was created
    manually by the developer.

    @property source
    @type {String}
    @default ''
    @readonly
   */
  source: '',

  uploadBinary(url, opts) {
    opts.contentType = 'application/octet-stream';
    return upload(this, url, opts, (request) => {
      return request.send(get(this, 'blob'));
    });
  },

  upload(url, opts) {
    return upload(this, url, opts, (request, options) => {
      // Build the form
      let form = new FormData();

      Object.keys(options.data).forEach((key) => {
        if (key === options.fileKey) {
          form.append(key, options.data[key], get(this, 'name'));
        } else {
          form.append(key, options.data[key]);
        }
      });

      return request.send(form);
    });
  },

  readAsArrayBuffer() {
    let reader = new FileReader({ label: `Read ${get(this, 'name')} as an ArrayBuffer` });
    return reader.readAsArrayBuffer(this.blob);
  },

  readAsDataURL() {
    let reader = new FileReader({ label: `Read ${get(this, 'name')} as a Data URI` });
    return reader.readAsDataURL(this.blob);
  },

  readAsBinaryString() {
    let reader = new FileReader({ label: `Read ${get(this, 'name')} as a binary string` });
    return reader.readAsBinaryString(this.blob);
  },

  readAsText() {
    let reader = new FileReader({ label: `Read ${get(this, 'name')} as text` });
    return reader.readAsText(this.blob);
  }

}).reopenClass({

  /**
    Creates a file object that can be read or uploaded to a
    server from a Blob object.

    @static
    @method fromBlob
    @param {Blob} blob The blob to create the file from.
    @param {String} [source] The source that created the blob.
    @return {File} A file object
   */
  fromBlob(blob, source='blob') {
    let file = this.create();
    Object.defineProperty(file, 'blob', {
      writeable: false,
      enumerable: false,
      value: blob
    });
    Object.defineProperty(file, 'source', {
      writeable: false,
      value: source
    });

    return file;
  },

  /**
    Creates a file object that can be read or uploaded to a
    server from a data URL.

    @static
    @method fromDataURL
    @param {String} dataURL The data URL to create the file from.
    @param {String} [source] The source of the data URL.
    @return {File} A file object
   */
  fromDataURL(dataURL, source='data-url') {
    let [typeInfo, base64String] = dataURL.split(',');
    let mimeType = typeInfo.match(/:(.*?);/)[1];

    let binaryString = atob(base64String);
    let binaryData = new Uint8Array(binaryString.length);

    for (let i = 0, len = binaryString.length; i < len; i++) {
      binaryData[i] = binaryString.charCodeAt(i);
    }

    let blob = new Blob([binaryData], { type: mimeType });

    return this.fromBlob(blob, source);
  }
});
