import Ember from "ember";
import DinoSheet from "dinosheets";
import trim from "../system/trim";
import w from "../computed/w";
import computed from '../system/computed';

var get = Ember.get;
var set = Ember.set;
var keys = Ember.keys;

var bind = Ember.run.bind;

var isDragAndDropSupported = (function () {
  var supported = null;
  return function (runtimes) {
    if (runtimes.indexOf('html5') === -1) {
      return false;
    }

    if (supported == null) {
      supported = 'draggable' in document.createElement('span');
    }
    return supported;
  };
}());

var styleSheet;
var sharedStyleSheet = function () {
  if (styleSheet == null) {
    styleSheet = new DinoSheet();
  }
  return styleSheet;
};

var slice = Array.prototype.slice;

const deprecateAction = function (action) {
  Ember.deprecate(`
The 'action' attribute is unsupported by this version of ember-plupload.
You should pass in the url as the first argument for the upload:

    actions: {
      ${get(this, 'onfileadd')}: function (file) {
        file.upload(${action});
      }
    }

Please consult the documentation for how to upload files from your action:
https://github.com/paddle8/ember-plupload#configuration`, action == null
  );
};

export default Ember.Component.extend({
  classNames: ['pl-uploader'],

  name: null,

  'for-dropzone': null,
  'when-queued': computed('onfileadd', {
    get() {
      return get(this, 'onfileadd');
    },
    set(_, value) {
      Ember.deprecate('The `when-queued` action is deprecated, use `onfileadd` instead.');
      set(this, 'onfileadd', value);
      return value;
    }
  }),

  onfileadd: null,
  onerror: null,

  uploader: Ember.inject.service(),

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

  dropzone: computed('for-dropzone', {
    get() {
      var dropzone = {};
      var id = get(this, 'for-dropzone') || 'dropzone-for-' + get(this, 'elementId');
      dropzone.enabled = false;

      if (isDragAndDropSupported(get(this, 'runtimes'))) {
        dropzone.enabled = true;
        dropzone.id = id;
        dropzone.data = null;
        dropzone['drag-and-drop'] = {
          'dropzone-id': id,
          'drag-data': null
        };
      }
      return dropzone;
    }
  }),

  config: computed({
    get() {
      var config  = {
        url: true, // Required to init plupload
        browse_button: get(this, 'for'),
        filters: {
          max_file_size: get(this, 'max-file-size'),
          prevent_duplicates: get(this, 'no-duplicates')
        },

        multi_selection: get(this, 'multiple'),

        runtimes: get(this, 'runtimes').join(','),
        container: get(this, 'elementId'),
        flash_swf_url: this.BASE_URL + 'Moxie.swf',
        silverlight_xap_url: this.BASE_URL + 'Moxie.xap',
        unique_names: get(this, 'unique-names')
      };
      deprecateAction.call(this, get(this, 'action'));

      var filters = get(this, 'fileFilters') || {};
      keys(filters).forEach((filter) => {
        if (get(this, filter)) {
          config.filters[filter] = get(this, filter);
        }
      });

      if (isDragAndDropSupported(get(this, 'runtimes'))) {
        config.drop_element = get(this, 'dropzone.id');
      }

      if (get(this, 'extensions.length')) {
        config.filters.mime_types = [{
          extensions: get(this, 'extensions').map(function (ext) {
            return ext.toLowerCase();
          }).join(',')
        }];
      }

      return config;
    }
  }),

  didInsertElement: Ember.on('didInsertElement', function() {
    Ember.run.scheduleOnce('afterRender', this, 'attachUploader');
    Ember.run.scheduleOnce('afterRender', this, 'setupDragListeners');
  }),

  attachUploader() {
    var uploader = get(this, 'uploader');
    var queue = uploader.findOrCreate(get(this, 'name'), this, get(this, 'config'));
    set(this, 'queue', queue);

    this._firstDragEnter = false;
    this._secondDragEnter = false;
    this._invalidateDragData();
  },

  setupDragListeners() {
    var dropzoneId = get(this, 'dropzone.id');
    if (dropzoneId) {
      var handlers = this.eventHandlers = {
        dragenter: bind(this, 'enteredDropzone'),
        dragleave: bind(this, 'leftDropzone')
      };

      keys(handlers).forEach(function (key) {
        Ember.$(document).on(key, '#' + dropzoneId, handlers[key]);
      });
    }
  },

  detachUploader: Ember.on('willDestroyElement', function () {
    var queue = get(this, 'queue');
    if (queue) {
      queue.orphan();
      set(this, 'queue', null);
    }
    let sheet = sharedStyleSheet();
    sheet.css(`#${get(this, 'dropzone.id')} *`, null);
    sheet.applyStyles();
  }),

  teardownDragListeners: Ember.on('willDestroyElement', function () {
    var dropzoneId = get(this, 'dropzone.id');
    if (dropzoneId) {
      var handlers = this.eventHandlers;
      keys(handlers).forEach(function (key) {
        Ember.$(document).off(key, '#' + dropzoneId, handlers[key]);
      });
      this.eventHandlers = null;
    }
  }),

  dragData: null,
  enteredDropzone({ originalEvent: evt }) {
    if (this._firstDragEnter) {
      this._secondDragEnter = true;
    } else {
      this._firstDragEnter = true;
      this.activateDropzone(evt);
    }
  },

  leftDropzone() {
    if (this._secondDragEnter) {
      this._secondDragEnter = false;
    } else {
      this._firstDragEnter = false;
    }

    if (!this._firstDragEnter && !this._secondDragEnter) {
      this.deactivateDropzone();
    }
  },

  activateDropzone(evt) {
    let sheet = sharedStyleSheet();
    sheet.css(`#${get(this, 'dropzone.id')} *`, {
      pointerEvents: 'none'
    });
    Ember.run.scheduleOnce('render', sheet, 'applyStyles');
    set(this, 'dragData', get(evt, 'dataTransfer'));
  },

  deactivateDropzone() {
    let sheet = sharedStyleSheet();
    sheet.css(`#${get(this, 'dropzone.id')} *`, null);
    Ember.run.scheduleOnce('render', sheet, 'applyStyles');

    this._firstDragEnter = this._secondDragEnter = false;
    set(this, 'dragData', null);
  },

  _invalidateDragData: Ember.observer('queue.length', function () {
    // Looks like someone dropped a file
    const filesAdded = get(this, 'queue.length') > this._queued;
    const filesDropped = get(this, 'queue.length') === 0 && this._queued === 0;
    if ((filesAdded || filesDropped) && get(this, 'dragData')) {
      this.deactivateDropzone();
    }
    this._queued = get(this, 'queue.length');
  }),

  setDragDataValidity: Ember.observer('dragData', Ember.on('init', function () {
    if (!isDragAndDropSupported(get(this, 'runtimes'))) { return; }

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
      // @DEPRECATED
      set(this, 'dropzone.drag-and-drop.drag-data', { valid: isValid });

      set(this, 'dropzone.active', true);
      set(this, 'dropzone.valid', isValid);
    } else {
      // @DEPRECATED
      set(this, 'dropzone.drag-and-drop.drag-data', null);

      set(this, 'dropzone.active', false);
      set(this, 'dropzone.valid', null);
    }
  }))
});
