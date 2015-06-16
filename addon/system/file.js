/* global mOxie */
import Ember from "ember";
import computed from './computed';

const get = Ember.get;
const reads = Ember.computed.reads;

const later = Ember.run.later;

const RSVP = Ember.RSVP;
const mOxieFileReader = mOxie.FileReader;

const keys = Ember.keys;

const mergeDefaults = function (defaults, options) {
  const unsetKeys = Ember.A(keys(defaults)).removeObjects(keys(options));
  const settings = Ember.copy(options, true);

  for (let i = 0, len = unsetKeys.length; i < len; i++) {
    let key = unsetKeys[i];
    settings[key] = defaults[key];
  }
  return settings;
};

const settingsToConfig = function (settings) {
  let {
    url, method, accepts, contentType, headers,
    data, maxRetries, chunkSize, multipart, fileKey
  } = mergeDefaults({
    method: 'POST',
    accepts: ['application/json', 'text/javascript'],
    contentType: get(this, 'type'),
    headers: {},
    data: {},
    maxRetries: 0,
    chunkSize: 0,
    multipart: true,
    fileKey: 'file'
  }, settings);

  if (headers.Accept == null) {
    if (!Ember.Array.detect(accepts)) {
      accepts = Ember.A([accepts]).compact();
    }
    headers.Accept = accepts.join(',');
  }

  // Switch setting content type according to
  // the type of request we're sending.
  if (contentType) {
    if (multipart) {
      data['Content-Type'] = contentType;
    } else {
      headers['Content-Type'] = contentType;
    }
  }

  return {
    url: url,
    method: method,
    headers: headers,
    multipart: multipart,
    multipart_params: data,
    max_retries: maxRetries,
    chunk_size: chunkSize,
    file_data_name: fileKey
  };
};

/**
  A representation of a single file being uploaded
  by the `UploadQueue`.

  @namespace ember-plupload
  @class File
  @extends Ember.Object
 */
export default Ember.Object.extend({

  /**
    The unique ID of the file.

    @property id
    @type String
   */
  id: reads('file.id'),

  /**
    The name of the file.

    @property name
    @type String
   */
  name: reads('file.name'),

  /**
    The size of the file in bytes

    @property size
    @type Number
   */
  size: reads('file.size'),

  /**
    The content type of the file

    @property type
    @type String
   */
  type: reads('file.type'),

  /**
    The current upload progress of the file,
    which is a number between 0 and 100.

    @property progress
    @type Number
   */
  progress: computed({
    get() {
      return get(this, 'file.percent');
    }
  }),

  /**
    Remove the file from the upload queue.

    @method destroy
   */
  destroy() {
    if (this.isDestroyed) { return; }
    get(this, 'uploader').removeFile(get(this, 'file'));
    this.isDestroyed = true;
  },

  upload(url, settings) {
    var uploader = get(this, 'uploader');
    this._deferred = RSVP.defer(`File: '${get(this, 'id')}' Upload file`);

    if (settings == null) {
      if (typeof url === 'object') {
        settings = url;
      } else {
        settings = { url };
      }
    } else if (url) {
      settings.url = url;
    }

    this.settings = settingsToConfig.call(this, settings);

    if (this.file.upload) {
      // when plupload has the paralllel upload API available
      this.file.upload(this.settings);
    } else {
      // Start uploading the files
      //
      // This number is chosen due to comments in
      // https://github.com/paddle8/ember-plupload/issues/22
      //
      // When we upgrade plupload so it takes
      // settings as part of the upload process,
      // we'll remove this.
      later(uploader, 'start', 400);
    }

    return this._deferred.promise;
  },

  read(options = { as: 'data-url' }) {
    let file = get(this, 'file').getSource();
    let reader = new mOxieFileReader();
    let { promise, resolve, reject } = RSVP.defer();
    reader.onloadend = resolve;
    reader.onerror = reject;

    switch (options.as) {
    case 'array-buffer':
      reader.readAsArrayBuffer(file);
      break;
    case 'data-url':
      reader.readAsDataURL(file);
      break;
    case 'binary-string':
      reader.readAsBinaryString(file);
      break;
    case 'text':
      reader.readAsText(file);
      break;
    }

    return promise.then(function () {
      return reader.result;
    }, function () {
      return reader.error;
    });
  }
});
