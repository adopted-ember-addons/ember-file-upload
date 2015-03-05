import Ember from "ember";
import trim from "../system/trim";
import w from "../computed/w";

var get = Ember.get;
var set = Ember.set;

var generateGuid = Ember.generateGuid;
var isDragAndDropSupported = (function () {
  var supported = false;
  return function () {
    if (supported == null) {
      supported = 'draggable' in document.createElement('span');
    }
    return supported;
  };
}());

var slice = Array.prototype.slice;
var alias = Ember.computed.alias;

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
        'dropzone-id': generateGuid(),
        'drag-data': null,
        'is-drag-data-valid': true
      };
    }
    return features;
  }.property(),

  attachUploader: function () {
    var manager = get(this, 'fileUploadManager');
    var config  = {
      on_queued:           get(this, 'onQueued'),
      runtimes:            get(this, 'runtimes').join(','),
      browse_button:       get(this, 'for'),
      url:                 get(this, 'action'),
      flash_swf_url:       this.BASE_URL + 'Moxie.swf',
      silverlight_xap_url: this.BASE_URL + 'Moxie.xap',
      filters: {},
      multipart_params: get(this, 'multipart-params') || {},
      headers: {
        Accept: get(this, 'accept')
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

    set(this, 'fileBucket', manager.find(get(this, 'name'), this, config));

    this._dragEnters = 0;
    this._invalidateDragData();
  }.on('didInsertElement'),

  detachUploader: function () {
    var bucket = get(this, 'fileBucket');
    if (bucket) {
      bucket.orphan(this);
      set(this, 'fileBucket', null);
    }
  }.on('willDestroyElement'),

  dragData: alias('features.drag-and-drop.drag-data'),
  dragEnter: function (evt) {
    this._dragEnters++;
    set(this, 'dragData', get(evt, 'originalEvent.dataTransfer'));
  },

  dragLeave: function () {
    this._dragEnters--;
    if (this._dragEnters === 0) {
      set(this, 'dragData', null);
    }
  },

  _invalidateDragData: function () {
    if (get(this, 'fileBucket.length') > this._queued && get(this, 'dragData')) {
      set(this, 'dragData', null);
    }
    this._queued = get(this, 'fileBucket.length');
  }.observes('fileBucket.length'),

  setDragDataValidity: function () {
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
    set(this, 'features.drag-and-drop', 'is-drag-data-valid', isValid);
  }.observes('dragData').on('init')
});
