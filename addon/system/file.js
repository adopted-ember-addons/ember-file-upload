import Ember from "ember";

var get = Ember.get;
var reads = Ember.computed.reads;

/**
  A representation of a single file being uploaded
  by the `FileUploadManager`.

  @namespace ember-plupload
  @class File
  @extends Ember.Object
 */
var File = Ember.Object.extend(/** @scope File.prototype */{

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
    The current upload progress of the file,
    which is a number between 0 and 100.

    @property progress
    @type Number
   */
  progress: function () {
    return get(this, 'file.percent');
  }.property(),

  /**
    Remove the file from the upload queue.

    @method destroy
   */
  destroy: function () {
    get(this, 'uploader').removeFile(get(this, 'file'));
  },

  deferred: null,

  then: function (fulfill, reject) {
    return get(this, 'deferred.promise')
               .then(fulfill, reject);
  }

});

export default File;
