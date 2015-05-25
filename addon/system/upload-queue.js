/* globals plupload */
import Ember from "ember";
import File from "./file";
import trim from "./trim";

const get = Ember.get;
const set = Ember.set;
const bool = Ember.computed.bool;
const bind = Ember.run.bind;
const copy = Ember.copy;
const merge = Ember.merge;

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
    uploader.bind('BeforeUpload',   bind(this, 'configureUpload'));
    uploader.bind('UploadProgress', bind(this, 'progressDidChange'));
    uploader.bind('FileUploaded',   bind(this, 'fileUploaded'));
    uploader.bind('UploadComplete', bind(this, 'uploadComplete'));
    uploader.bind('Error',          bind(this, 'onError'));

    get(this, 'queues').pushObject(uploader);

    let settings = copy(uploader.settings);
    delete settings.url;
    set(this, 'settings', settings);

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

  refresh: function () {
    get(this, 'queues').invoke('refresh');
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

  configureUpload: function (uploader, file) {
    file = this.findProperty('id', file.id);
    // Reset settings for merging
    uploader.settings = copy(get(this, 'settings'));
    merge(uploader.settings, file.settings);

    this.progressDidChange(uploader, file);
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
    var rawHeaders = Ember.A(response.responseHeaders.split(/\n|\r/)).without('');
    var headers = rawHeaders.reduce(function (headers, header) {
      var parts = header.split(/^([A-Za-z_-]*:)/);
      if (parts.length > 0){
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

    // Notify plupload that our browse_button may have
    // changed locations
    Ember.run.later(uploader, 'refresh', 750);
  },

  garbageCollectUploader: function (uploader) {
    get(this, 'queues').removeObject(uploader);
    get(this, 'orphanedQueues').removeObject(uploader);
    this.filterProperty('uploader', uploader).invoke('destroy');
    uploader.unbindAll();
  },

  uploadComplete: function (uploader) {
    // Notify plupload that our browse_button may have
    // changed locations
    Ember.run.later(uploader, 'refresh', 750);
    this.notifyPropertyChange('progress');

    // Clean up the orphaned uploader and its files
    if (get(this, 'orphanedQueues').indexOf(uploader) !== -1) {
      this.garbageCollectUploader(uploader);
    }
  },

  onError: function (uploader, error) {
    if (error.file) {
      var file = this.findProperty('id', error.file.id);
      if (file == null) {
        file = File.create({
          uploader: uploader,
          file: file
        });
      }

      set(file, 'error', error);

      if (file._deferred) {
        file._deferred.reject(error);

      // This happended before the file got queued,
      // So we need to stub out `upload` and trigger
      // the queued event
      } else {
        file.upload = file.read = function () {
          Ember.run.debounce(uploader, 'refresh', 750);
          return Ember.RSVP.reject(error, `File: '${error.file.id}' ${error.message}`);
        };
        file.isDestroyed = true;

        get(this, 'target').sendAction('when-queued', file, {
          name: get(this, 'name'),
          uploader: uploader,
          queue: this
        });
      }
      this.notifyPropertyChange('length');
      Ember.run.debounce(uploader, 'refresh', 750);
    } else {
      set(this, 'error', error);
    }
  }
});
