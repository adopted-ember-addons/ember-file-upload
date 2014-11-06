import Ember from "ember";
import File from "./file";

var get = Ember.get;
var set = Ember.set;
var bool = Ember.computed.bool;
var run = Ember.run;
var later = Ember.run.later;
var bind = Ember.run.bind;

var summation = function (target, key) {
  return target.reduce(function (E, obj) {
    return E + get(obj, key);
  }, 0);
};

var fileWasAdded = function (file) {
  var self = this;
  return run(function () {
    self.triggerAction({
      target: get(self, 'target'),
      action: get(self, 'onQueued'),
      actionContext: {
        name: get(self, 'name'),
        file: file,
        context: get(self, 'contexts').get(get(file, 'uploader'))
      }
    });
  });
};

/**

  @namespace ember-plupload
  @class FileBucket
  @extend Ember.ArrayProxy
  @extend Ember.TargetActionSupport
 */
var FileBucket = Ember.ArrayProxy.extend(Ember.TargetActionSupport, /** @scope FileBucket.prototype */{

  name: null,

  onUpload: null,

  isUploading: bool('length'),

  queues: null,

  init: function () {
    set(this, 'queues', []);
    set(this, 'orphanedQueues', []);

    set(this, 'content', []);
    set(this, 'contexts', Ember.Map.create());
    this._super();
  },

  makeQueue: function (config) {
    var context = config.context;
    delete config.context;

    var uploader = new plupload.Uploader(config);

    uploader.bind('FilesAdded',     bind(this, 'filesAdded'));
    uploader.bind('FilesRemoved',   bind(this, 'filesRemoved'));
    uploader.bind('BeforeUpload',   bind(this, 'progressDidChange'));
    uploader.bind('UploadProgress', bind(this, 'progressDidChange'));
    uploader.bind('FileUploaded',   bind(this, 'fileUploaded'));
    uploader.bind('UploadComplete', bind(this, 'uploadComplete'));
    uploader.bind('Error',          bind(this, '_onError'));

    get(this, 'queues').pushObject(uploader);
    get(this, 'contexts').set(uploader, context);

    uploader.init();
  },

  /**
    Orphan the active plupload object so
    we garbage collect the queues.
   */
  orphan: function () {
    var queue = get(this, 'queues.lastObject');
    if (get(queue, 'total.queued') > 0) {
      get(this, 'orphanedQueues').pushObject(queue);
    } else {
      this.garbageCollectUploader(queue);
    }
  },

  destroy: function () {
    this._super();
    get(this, 'queues').invoke('unbindAll');
    set(this, 'content', []);
    set(this, 'queues', null);
    set(this, 'contexts', null);
  },

  progress: function () {
    var queues        = get(this, 'queues'),
        totalSize     = summation(queues, 'total.size'),
        totalUploaded = summation(queues, 'total.loaded'),
        percent       = totalUploaded / totalSize || 0;

    return Math.floor(percent * 100);
  }.property(),

  filesAdded: function (uploader, files) {
    for (var i = 0, len = files.length; i < len; i++) {
      var file = File.create({
        uploader: uploader,
        file: files[i],
        deferred: Ember.RSVP.defer()
      });

      this.pushObject(file);

      fileWasAdded.call(this, file);
    }

    // Start uploading the files
    later(uploader, 'start', 100);
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

  fileUploaded: function (uploader, file, response) {
    var results = response;

    if ($.trim(results.response)) {
      results = $.parseJSON(results.response);
    }

    // NOTE: Plupload calls UploadProgress upon triggering FileUploaded,
    //       so we don't need to trigger a progress event
    if (response.status === 204 ||
        response.status === 200) {
      file = this.findProperty('id', file.id);
      if (file) {
        this.removeObject(file);
      }

      var headers = response.responseHeaders.split('\n').without('').reduce(function (headers, header) {
        var parts = header.split(/^([A-Za-z_-]*:)/);
        headers[parts[1].slice(0, -1)] = $.trim(parts[2]);
        return headers;
      }, {});

      run(this, function () {
        this.triggerAction({
          target: get(this, 'target'),
          action: get(this, 'onUpload'),
          actionContext: {
            name: get(this, 'name'),
            response: results,
            headers: headers,
            file: file,
            context: get(this, 'contexts').get(uploader)
          }
        });
      });
    } else {
      file = this.findProperty('id', file.id);
      if (file) {
        this.removeObject(file);
      }

      this.triggerAction({
        target: get(this, 'target'),
        action: get(this, 'onError'),
        actionContext: {
          code: response.status,
          name: get(this, 'name'),
          response: results,
          context: get(this, 'contexts').get(uploader)
        }
      });
    }
  },

  garbageCollectUploader: function (uploader) {
    get(this, 'queues').removeObject(uploader);
    get(this, 'contexts').remove(uploader);
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

  _onError: function (uploader, error) {
    if (error.file) {
      var file = this.findProperty('id', error.file.id);
      set(file, 'error', error.file);
    } else {
      set(this, 'error', error);
    }
  }
});

export default FileBucket;
