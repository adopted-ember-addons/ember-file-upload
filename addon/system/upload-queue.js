/* globals plupload */
import Ember from 'ember';
import File from './file';
import trim from './trim';
import sumBy from '../system/sum-by';

const { get, set } = Ember;
const { copy, merge } = Ember;
const computed = Ember.computed;
const bool = Ember.computed.bool;
const bind = Ember.run.bind;
const keys = Object.keys;

var getHeader = function (headers, header) {
  let headerKeys = Ember.A(keys(headers));
  let headerIdx = headerKeys.map((s) => s.toLowerCase()).indexOf(header.toLowerCase());
  if (headerIdx !== -1) {
    return headers[headerKeys[headerIdx]];
  }
  return null;
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

  init() {
    set(this, 'queues', Ember.A([]));
    set(this, 'orphanedQueues', Ember.A([]));

    set(this, 'content', Ember.A([]));
    this._super();
  },

  configure(config = {}) {
    var uploader = new plupload.Uploader(config);

    uploader.bind('FilesAdded',     bind(this, 'filesAdded'));
    uploader.bind('FilesRemoved',   bind(this, 'filesRemoved'));
    uploader.bind('BeforeUpload',   bind(this, 'configureUpload'));
    uploader.bind('UploadProgress', bind(this, 'progressDidChange'));
    uploader.bind('FileUploaded',   bind(this, 'fileUploaded'));
    uploader.bind('UploadComplete', bind(this, 'uploadComplete'));
    uploader.bind('Error',          bind(this, 'onError'));

    get(this, 'queues').pushObject(uploader);

    // Set browse_button and drop_element as
    // references to the buttons so mOxie doesn't
    // get confused when the dom might be detached
    uploader.settings.browse_button = [config.browse_button];
    if (config.drop_element) {
      uploader.settings.drop_element = [config.drop_element];
    }

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
  orphan() {
    var orphans = get(this, 'orphanedQueues');
    var activeQueues = get(this, 'queues').filter(function (queue) {
      return orphans.indexOf(queue) === -1;
    });
    var freshestQueue = get(Ember.A(activeQueues), 'lastObject');
    if (get(freshestQueue, 'total.queued') > 0) {
      orphans.pushObject(freshestQueue);
    } else {
      this.garbageCollectUploader(freshestQueue);
    }
  },

  destroy() {
    this._super();
    get(this, 'queues').invoke('unbindAll');
    set(this, 'content', Ember.A([]));
    set(this, 'queues', null);
  },

  refresh() {
    get(this, 'queues').invoke('refresh');
  },

  size: computed({
    get: function _get() {
      return sumBy(get(this, 'queues'), 'total.size') || 0;
    }
  }),

  loaded: computed({
    get: function _get() {
      return sumBy(get(this, 'queues'), 'total.loaded') || 0;
    }
  }),

  progress: computed('size', 'loaded', {
    get: function _get() {
      let percent = get(this, 'loaded') / get(this, 'size') || 0;
      return Math.floor(percent * 100);
    }
  }),

  filesAdded(uploader, files) {
    for (let i = 0, len = files.length; i < len; i++) {
      var file = File.create({
        uploader: uploader,
        file: files[i]
      });

      this.pushObject(file);
      get(this, 'target').sendAction('onfileadd', file, {
        name: get(this, 'name'),
        uploader: uploader,
        queue: this
      });

      this.notifyPropertyChange('size');
      this.notifyPropertyChange('loaded');
    }
  },

  filesRemoved(uploader, files) {
    for (var i = 0, len = files.length; i < len; i++) {
      var file = this.findBy('id', files[i].id);
      if (file) {
        this.removeObject(file);
      }
    }

    this.notifyPropertyChange('size');
    this.notifyPropertyChange('loaded');
  },

  configureUpload(uploader, file) {
    file = this.findBy('id', file.id);
    // Reset settings for merging
    uploader.settings = copy(get(this, 'settings'));
    merge(uploader.settings, file.settings);

    this.progressDidChange(uploader, file);
  },

  progressDidChange(uploader, file) {
    file = this.findBy('id', file.id);
    if (file) {
      file.notifyPropertyChange('progress');
    }

    this.notifyPropertyChange('size');
    this.notifyPropertyChange('loaded');
  },

  parseResponse(response) {
    var body = trim(response.response);
    var rawHeaders = Ember.A(response.responseHeaders.split(/\n|\r/)).without('');
    var headers = rawHeaders.reduce(function (E, header) {
      var parts = header.split(/^([A-Za-z_-]*:)/);
      if (parts.length > 0){
        E[parts[1].slice(0, -1)] = trim(parts[2]);
      }
      return E;
    }, {});

    let contentType = (getHeader(headers, 'Content-Type') || '').split(';');
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

  fileUploaded(uploader, file, response) {
    var results = this.parseResponse(response);
    file = this.findBy('id', file.id);
    if (file) {
      this.removeObject(file);
    }

    // NOTE: Plupload calls UploadProgress upon triggering FileUploaded,
    //       so we don't need to trigger a progress event
    if (Math.floor(results.status / 200) === 1) {
      file._deferred.resolve(results);
    } else {
      file._deferred.reject(results);
    }

    // Notify plupload that our browse_button may have
    // changed locations
    Ember.run.later(uploader, 'refresh', 750);
  },

  garbageCollectUploader(uploader) {
    get(this, 'queues').removeObject(uploader);
    get(this, 'orphanedQueues').removeObject(uploader);
    this.filterBy('uploader', uploader).invoke('destroy');
    uploader.unbindAll();
  },

  uploadComplete(uploader) {
    // Notify plupload that our browse_button may have
    // changed locations
    Ember.run.later(uploader, 'refresh', 750);
    this.notifyPropertyChange('loaded');
    this.notifyPropertyChange('size');

    // Clean up the orphaned uploader and its files
    if (get(this, 'orphanedQueues').indexOf(uploader) !== -1) {
      this.garbageCollectUploader(uploader);
    }
  },

  onError(uploader, error) {
    if (error.file) {
      var file = this.findBy('id', error.file.id);
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

        get(this, 'target').sendAction('onfileadd', file, {
          name: get(this, 'name'),
          uploader: uploader,
          queue: this
        });
      }
      this.notifyPropertyChange('length');
      Ember.run.debounce(uploader, 'refresh', 750);
    } else {
      set(this, 'error', error);
      get(this, 'target').sendAction('onerror', error);
    }
  }
});
