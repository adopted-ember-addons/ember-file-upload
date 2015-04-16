/* globals plupload */
import Ember from "ember";
import File from "./file";
import trim from "./trim";

var get = Ember.get;
var set = Ember.set;
var bool = Ember.computed.bool;
var bind = Ember.run.bind;

var summation = function (target, key) {
  return target.reduce(function (E, obj) {
    return E + get(obj, key);
  }, 0);
};

/**

  @namespace ember-plupload
  @class UploadQueue
  @extend Ember.ArrayProxy
 */
export default Ember.ArrayProxy.extend({

  name: null,

  uploading: bool('length'),

  queues: null,

  init: function () {
    set(this, 'queues', Ember.A([]));
    set(this, 'orphanedQueues', Ember.A([]));

    set(this, 'content', Ember.A([]));
    this._super();
  },

  configure: function (config) {
    var uploader = new plupload.Uploader(config);

    uploader.bind('FilesAdded',     bind(this, 'filesAdded'));
    uploader.bind('FilesRemoved',   bind(this, 'filesRemoved'));
    uploader.bind('BeforeUpload',   bind(this, 'progressDidChange'));
    uploader.bind('UploadProgress', bind(this, 'progressDidChange'));
    uploader.bind('FileUploaded',   bind(this, 'fileUploaded'));
    uploader.bind('UploadComplete', bind(this, 'uploadComplete'));
    uploader.bind('Error',          bind(this, 'onError'));

    get(this, 'queues').pushObject(uploader);

    uploader.init();
    return uploader;
  },

  /**
    Orphan the active plupload object so
    we garbage collect the queues.
   */
  orphan: function () {
    var orphans = get(this, 'orphanedQueues');
    var activeQueues = get(this, 'queues').filter(function (queue) {
      return orphans.indexOf(queue) === -1;
    });
    var queue = get(Ember.A(activeQueues), 'lastObject');
    if (get(queue, 'total.queued') > 0) {
      orphans.pushObject(queue);
    } else {
      this.garbageCollectUploader(queue);
    }
  },

  destroy: function () {
    this._super();
    get(this, 'queues').invoke('unbindAll');
    set(this, 'content', Ember.A([]));
    set(this, 'queues', null);
  },

  progress: Ember.computed(function () {
    var queues        = get(this, 'queues'),
        totalSize     = summation(queues, 'total.size'),
        totalUploaded = summation(queues, 'total.loaded'),
        percent       = totalUploaded / totalSize || 0;

    return Math.floor(percent * 100);
  }),

  filesAdded: function (uploader, files) {
    for (var i = 0, len = files.length; i < len; i++) {
      var file = File.create({
        uploader: uploader,
        file: files[i]
      });

      this.pushObject(file);
      get(this, 'target').sendAction('when-queued', file, {
        name: get(this, 'name'),
        uploader: uploader,
        queue: this
      });
    }
  },

  filesRemoved: function (uploader, files) {
    for (var i = 0, len = files.length; i < len; i++) {
      var file = this.findProperty('id', files[i].id);
      if (file) {
        this.removeObject(file);
      }
    }
  },

  progressDidChange: function (uploader, file) {
    file = this.findProperty('id', file.id);
    if (file) {
      file.notifyPropertyChange('progress');
    }

    this.notifyPropertyChange('progress');
  },

  parseResponse: function (response) {
    var body = trim(response.response);
    var rawHeaders = Ember.A(response.responseHeaders.split(/\\n|\\r/)).without('');
    var headers = rawHeaders.reduce(function (headers, header) {
      var parts = header.split(/^([A-Za-z_-]*:)/);
      if(parts.length > 0){
        headers[parts[1].slice(0, -1)] = trim(parts[2]);
      }
      return headers;
    }, {});

    var contentType = (headers['Content-Type'] || '').split(';');
    // Parse body according to the Content-Type received by the server
    if (contentType.indexOf('text/html') !== -1) {
      body = Ember.$.parseHTML(body);
    } else if (contentType.indexOf('text/xml') !== -1) {
      body = Ember.$.parseXML(body);
    } else if (contentType.indexOf('application/json') !== -1 ||
               contentType.indexOf('text/javascript') !== -1 ||
               contentType.indexOf('application/javascript') !== -1) {
      body = Ember.$.parseJSON(body);
    }

    return {
      status: response.status,
      body: body,
      headers: headers
    };
  },

  fileUploaded: function (uploader, file, response) {
    var results = this.parseResponse(response);
    file = this.findProperty('id', file.id);
    if (file) {
      this.removeObject(file);
    }

    // NOTE: Plupload calls UploadProgress upon triggering FileUploaded,
    //       so we don't need to trigger a progress event
    if (results.status === 204 ||
        results.status === 200) {
      file._deferred.resolve(results);
    } else {
      file._deferred.reject(results);
    }
  },

  garbageCollectUploader: function (uploader) {
    get(this, 'queues').removeObject(uploader);
    get(this, 'orphanedQueues').removeObject(uploader);
    this.filterProperty('uploader', uploader).invoke('destroy');
    uploader.unbindAll();
  },

  uploadComplete: function (uploader) {
    // Clean up the orphaned uploader and it's files
    if (get(this, 'orphanedQueues').indexOf(uploader) !== -1) {
      this.garbageCollectUploader(uploader);
    }
  },

  onError: function (uploader, error) {
    if (error.file) {
      var file = this.findProperty('id', error.file.id);
      set(file, 'error', error.file);
    } else {
      set(this, 'error', error);
    }
  }
});
