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

  'for-dropzone': null,
  'when-queued': null,

  /**
    A cascading list of runtimes to fallback on to
    for uploading files with.

    @property runtimes
    @type String[]
    @default ['html5', 'html4', 'flash', 'silverlight']
   */
  runtimes: w(['html5', 'html4', 'flash', 'silverlight']),
  extensions: w(),

  "max-file-size": 0,
  "no-duplicates": false,

  multiple: true,
  "unique-names": false,

  features: Ember.computed('for-dropzone', function () {
    var features = {};
    var id = get(this, 'for-dropzone') || 'dropzone-for-' + get(this, 'elementId');
    features.enabled = false;

    if (isDragAndDropSupported()) {
      features.enabled = true;
      features.id = id;
      features.data = null;
      features['drag-and-drop'] = {
        'dropzone-id': id,
        'drag-data': null
      };
    }
    return features;
  }),

  config: Ember.computed(function () {
    var config  = {
      url: true, // Required to init plupload
      browse_button: get(this, 'for'),
      filters: {
        max_file_size: get(this, 'max-file-size'),
        prevent_duplicates: get(this, 'no-duplicates')
      },

      multi_selection: get(this, 'multiple'),
      required_features: true,

      runtimes: get(this, 'runtimes').join(','),
      container: get(this, 'elementId'),
      flash_swf_url: this.BASE_URL + 'Moxie.swf',
      silverlight_xap_url: this.BASE_URL + 'Moxie.xap',
      unique_names: get(this, 'unique-names')
    };

    var filters = get(this, 'fileFilters') || {};
    keys(filters).forEach((filter) => {
      if (get(this, filter)) {
        config.filters[filter] = get(this, filter);
      }
    });

    if (isDragAndDropSupported()) {
      config.drop_element = get(this, 'features.id');
    }

    if (get(this, 'extensions.length')) {
      config.filters.mime_types = [{
        extensions: get(this, 'extensions').map(function (ext) {
          return ext.toLowerCase();
        }).join(',')
      }];
    }

    return config;
  }),

  attachUploader: Ember.on('didInsertElement', function () {
    var manager = get(this, 'uploadQueueManager');
    var queue = manager.find(get(this, 'name'), this, get(this, 'config'));
    set(this, 'queue', queue);

    this._dragEnters = 0;
    this._invalidateDragData();
  }),

  detachUploader: Ember.on('willDestroyElement', function () {
    var queue = get(this, 'queue');
    if (queue) {
      queue.orphan();
      set(this, 'queue', null);
    }
  }),

  setupDragListeners: Ember.on('didInsertElement', function () {
    var dropzoneId = get(this, 'features.id');
    if (dropzoneId) {
      var handlers = this.eventHandlers = {
        dragenter: bind(this, 'enteredDropzone'),
        dragleave: bind(this, 'leftDropzone')
      };

      keys(handlers).forEach(function (key) {
        Ember.$(document).on(key, '#' + dropzoneId, handlers[key]);
      });
    }
  }),

  teardownDragListeners: Ember.on('willDestroyElement', function () {
    var dropzoneId = get(this, 'features.id');
    if (dropzoneId) {
      var handlers = this.eventHandlers;
      keys(handlers).forEach(function (key) {
        Ember.$(document).off(key, '#' + dropzoneId, handlers[key]);
      });
      this.eventHandlers = null;
    }
  }),

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

  _invalidateDragData: Ember.observer('queue.length', function () {
    if (get(this, 'queue.length') > this._queued && get(this, 'dragData')) {
      set(this, 'dragData', null);
    }
    this._queued = get(this, 'queue.length');
  }),

  setDragDataValidity: Ember.observer('dragData', Ember.on('init', function () {
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
      set(this, 'features.active', true);
      set(this, 'features.valid', isValid);
    } else {
      set(this, 'features.drag-and-drop.drag-data', null);
      set(this, 'features.active', false);
      set(this, 'features.valid', null);
    }
  }))
});
