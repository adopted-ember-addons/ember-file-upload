import Ember from "ember";
import trim from "../system/trim";

var get = Ember.get;
var set = Ember.set;
var bool = Ember.computed.bool;
var assert = Ember.assert;
var merge = Ember.merge;
var isDragAndDropSupported;
var slice = Array.prototype.slice;

var reads = Ember.computed.reads;
var alias = Ember.computed.alias;

var w = Ember.String.w;

var PlUploader = Ember.Component.extend(/** @scope PlUploader */{

  classNames: ['pl-uploader'],

  classNameBindings: ['isValid:valid:invalid', 'hasDragData:drag-over', 'areAnyFilesUploading:uploading'],

  dragData: false,

  name: null,

  'when-queued': alias('onQueued'),
  onQueued: 'fileQueued',

  /**
    A cascading list of runtimes to fallback on to
    for uploading files with.

    @property runtimes
    @type String[]
    @default ['html5', 'html4', 'flash', 'silverlight']
   */
  runtimes: ['html5', 'html4', 'flash', 'silverlight'],

  extensions: [],

  "multipart-params": alias('params'),
  params: null,

  "max-file-size": alias('maximumFileSize'),
  maxiumumFileSize: null,

  "no-duplicates": alias('preventDuplicates'),
  preventDuplicates: null,

  "max-retries": alias('maxRetries'),
  maxRetries: 0,

  "chunk-size": alias('chunkSize'),
  chunkSize: 0,


  isDragAndDropSupported: function () {
    if (isDragAndDropSupported == null) {
      isDragAndDropSupported = 'draggable' in document.createElement('span');
    }
    return isDragAndDropSupported;
  }.property(),

  hasDragData: bool('dragData'),

  queued: reads('fileBucket.length'),

  areAnyFilesUploading: reads('fileBucket.isUploading'),

  shouldShowPrompt: function () {
    return !(get(this, 'hasDragData') || get(this, 'areAnyFilesUploading'));
  }.property('hasDragData', 'areAnyFilesUploading'),

  progress: reads('fileBucket.progress'),

  init: function () {
    this._super();
    this._dragEnters = 0;

    var extensions = get(this, 'extensions');
    if (extensions) {
      if (typeof extensions === 'string') {
        extensions = w(extensions);
      }

      set(this, 'extensions', extensions.map(function (ext) {
        return ext.toLowerCase();
      }));
    }

    if (get(this, 'name') == null) {
      assert("{{pl-uploader}} requires a 'name' attribute to work correctly.");
    }
  },

  dropTargetId: reads('elementId'),

  attachUploader: function () {
    if (get(this, 'action') == null || get(this, 'fileBucket')) {
      return;
    }

    var manager = get(this, 'fileUploadManager');
    var config  = {
      on_queued:           get(this, 'onQueued'),
      runtimes:            get(this, 'runtimes').join(','),
      browse_button:       get(this, 'for'),
      url:                 get(this, 'action'),
      flash_swf_url:       this.BASE_URL + 'Moxie.swf',
      silverlight_xap_url: this.BASE_URL + 'Moxie.xap',
      filters: {},
      multipart_params: {},
      headers: {
        Accept: 'application/json,text/javascript'
      }
    };

    if (get(this, 'isDragAndDropSupported')) {
      config.drop_element = get(this, 'dropTargetId');
    }
    config.container = get(this, 'elementId');

    if (get(this, 'extensions.length')) {
      config.filters.mime_types = [{ extensions: get(this, 'extensions').join(',') }];
    }
    if (get(this, 'maximumFileSize')) {
      config.filters.max_file_size = get(this, 'maximumFileSize');
    }
    if (get(this, 'preventDuplicates')) {
      config.filters.preventDuplicates = true;
    }
    config.max_retries = get(this, 'maxRetries');
    config.chunk_size = get(this, 'chunkSize');

    merge(config.multipart_params, get(this, 'params'));
    var bucket = manager.find(get(this, 'name'), this, config);

    set(this, 'fileBucket', bucket);
    this._queued = get(this, 'fileBucket.length');
  }.observes('action').on('didInsertElement'),

  willDestroyElement: function () {
    var bucket = get(this, 'fileBucket');
    if (bucket) {
      bucket.orphan(this);
      set(this, 'fileBucket', null);
    }
  },

  dragEnter: function (evt) {
    this._dragEnters++;
    set(this, 'dragData', get(evt, 'originalEvent.dataTransfer'));
  },

  _invalidateDragData: function () {
    if (get(this, 'queued') > this._queued && get(this, 'dragData')) {
      set(this, 'dragData', null);
    }
    this._queued = get(this, 'queued');
  }.observes('queued'),

  dragLeave: function () {
    this._dragEnters--;
    if (this._dragEnters === 0) {
      set(this, 'dragData', null);
    }
  },

  isValid: function () {
    var data       = get(this, 'dragData'),
        extensions = get(this, 'extensions');

    // Validate
    if (extensions.length) {
      return slice.call(get(data, 'items') || []).every(function (item) {
        var fileType = trim(item.type).toLowerCase();
        return extensions.any(function (ext) {
          return (new RegExp(ext + '$')).test(fileType);
        });
      });
    }
    return true;
  }.property('dragData')

});

export default PlUploader;
