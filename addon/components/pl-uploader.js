import Ember from "ember";
import trim from "../system/trim";
import w from "../computed/w";

var get = Ember.get;
var set = Ember.set;
var keys = Ember.keys;

var bind = Ember.run.bind;

var isDragAndDropSupported = (function () {
  var supported = null;
  return function () {
    if (supported == null) {
      supported = 'draggable' in document.createElement('span');
    }
    return supported;
  };
}());

var slice = Array.prototype.slice;

export default Ember.Component.extend({
  classNames: ['pl-uploader'],

  name: null,

  'when-queued': null,

  /**
    A cascading list of runtimes to fallback on to
    for uploading files with.

    @property runtimes
    @type String[]
    @default ['html5', 'html4', 'flash', 'silverlight']
   */
  runtimes: w(['html5', 'html4', 'flash', 'silverlight']),
  accept: w(['application/json', 'text/javascript']),
  extensions: w(),

  "multipart-params": null,
  "max-file-size": null,
  "no-duplicates": null,
  "max-retries": 0,
  "chunk-size": 0,

  features: function () {
    var features = {};

    if (isDragAndDropSupported()) {
      features['drag-and-drop'] = {
        'dropzone-id': 'dropzone-for-' + get(this, 'elementId'),
        'drag-data': null
      };
    }
    return features;
  }.property(),

  attachUploader: function () {
    var config  = {
      on_queued:           get(this, 'when-queued'),
      runtimes:            get(this, 'runtimes').join(','),
      browse_button:       get(this, 'for'),
      url:                 get(this, 'action'),
      flash_swf_url:       this.BASE_URL + 'Moxie.swf',
      silverlight_xap_url: this.BASE_URL + 'Moxie.xap',
      filters: {},
      multipart_params: get(this, 'multipart-params') || {},
      headers: {
        Accept: get(this, 'accept').join(',')
      }
    };

    if (isDragAndDropSupported()) {
      config.drop_element = get(this, 'features.drag-and-drop.dropzone-id');
    }
    config.container = get(this, 'elementId');

    if (get(this, 'extensions.length')) {
      config.filters.mime_types = [{
        extensions: get(this, 'extensions').map(function (ext) {
          return ext.toLowerCase();
        }).join(',')
      }];
    }
    if (get(this, 'max-file-size')) {
      config.filters.max_file_size = get(this, 'max-file-size');
    }
    if (get(this, 'no-duplicates')) {
      config.filters.preventDuplicates = get(this, 'no-duplicates');
    }
    config.max_retries = get(this, 'max-retries');
    config.chunk_size = get(this, 'chunk-size');

    var queues = get(this, 'uploadQueueManager');
    set(this, 'queue', queues.find(get(this, 'name'), config));

    this._dragEnters = 0;
    this._invalidateDragData();
  }.on('didInsertElement'),

  detachUploader: function () {
    var queue = get(this, 'queue');
    if (queue) {
      queue.orphan();
      set(this, 'queue', null);
    }
  }.on('willDestroyElement'),


  setupDragListeners: function () {
    var dropzoneId = get(this, 'features.drag-and-drop.dropzone-id');
    if (dropzoneId) {
      var handlers = this.eventHandlers = {
        dragenter: bind(this, 'enteredDropzone'),
        dragleave: bind(this, 'leftDropzone')
      };

      keys(handlers).forEach(function (key) {
        Ember.$(document).on(key, '#' + dropzoneId, handlers[key]);
      });
    }
  }.on('didInsertElement'),

  teardownDragListeners: function () {
    var dropzoneId = get(this, 'features.drag-and-drop.dropzone-id');
    if (dropzoneId) {
      var handlers = this.eventHandlers;
      keys(handlers).forEach(function (key) {
        Ember.$(document).off(key, '#' + dropzoneId, handlers[key]);
      });
      this.eventHandlers = null;
    }
  }.on('willDestroyElement'),

  dragData: null,
  enteredDropzone: function (evt) {
    this._dragEnters++;
    set(this, 'dragData', get(evt, 'originalEvent.dataTransfer'));
  },

  leftDropzone: function () {
    this._dragEnters--;
    if (this._dragEnters === 0) {
      set(this, 'dragData', null);
    }
  },

  _invalidateDragData: function () {
    if (get(this, 'queue.length') > this._queued && get(this, 'dragData')) {
      set(this, 'dragData', null);
    }
    this._queued = get(this, 'queue.length');
  }.observes('queue.length'),

  setDragDataValidity: function () {
    if (!isDragAndDropSupported()) { return; }

    var data       = get(this, 'dragData');
    var extensions = get(this, 'extensions');
    var isValid    = true;

    // Validate
    if (extensions.length) {
      isValid = slice.call(get(data, 'items') || []).every(function (item) {
        var fileType = trim(item.type).toLowerCase();
        return extensions.any(function (ext) {
          return (new RegExp(ext + '$')).test(fileType);
        });
      });
    }

    if (data) {
      set(this, 'features.drag-and-drop.drag-data', { valid: isValid });
    } else {
      set(this, 'features.drag-and-drop.drag-data', null);
    }
  }.observes('dragData').on('init')
});
