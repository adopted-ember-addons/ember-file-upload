import Ember from "ember";

var get = Ember.get;
var reads = Ember.computed.reads;

var later = Ember.run.later;

var RSVP = Ember.RSVP;

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
    The current upload progress of the file,
    which is a number between 0 and 100.

    @property progress
    @type Number
   */
  progress: Ember.computed(function () {
    return get(this, 'file.percent');
  }),

  /**
    Remove the file from the upload queue.

    @method destroy
   */
  destroy: function () {
    get(this, 'uploader').removeFile(get(this, 'file'));
  },

  upload: function () {
    var uploader = get(this, 'uploader');
    this._deferred = RSVP.defer();

    // Start uploading the files
    later(uploader, 'start', 100);

    return this._deferred.promise;
  }
});
