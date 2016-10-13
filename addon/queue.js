import Ember from 'ember';
import File from './file';
import sumBy from './computed/sum-by';

const { get, set, computed, observer } = Ember;

/**
  The Queue is a collection of files that
  are being manipulated by the user.

  Queues are designed to persist the state
  of uploads when a user navigates around your
  application.

  @namespace ember-file-upload
  @class Queue
  @extend Ember.Object
 */
export default Ember.Object.extend({

  init() {
    set(this, 'files', Ember.A());
    set(this, '_dropzones', Ember.A());
    this._super();
  },

  destroy() {
    this._super();
    get(this, 'fileQueue.queues').delete(get(this, 'name'));
    get(this, 'files').forEach((file) => set(file, 'queue', null));
    set(this, 'files', Ember.A());
  },

  /**
    The FileQueue service.

    @property fileQueue
    @type {FileQueue}
   */
  fileQueue: null,

  /**
    @method push
    @param {File} file The file to append to the queue
   */
  push(file) {
    file.queue = this;
    get(this, 'fileQueue.files').pushObject(file);
    get(this, 'files').pushObject(file);
  },

  /**
    @private
    @method _addFiles
    @param {FileList} fileList The event triggered from the DOM that contains a list of files
   */
  _addFiles(fileList) {
    let onfileadd = get(this, 'onfileadd');

    for (let i = 0, len = fileList.length; i < len; i++) {
      let fileBlob = fileList.item ? fileList.item(i) : fileList[i];
      let file = File.fromBlob(fileBlob);

      this.push(file);
      if(onfileadd) {
        onfileadd(file);
      }
    }
  },

  /**
    @method remove
    @param {File} file The file to remove from the queue.
   */
  remove(file) {
    file.queue = null;
    get(this, 'files').removeObject(file);
  },

  /**
    The unique identifier of the queue.

    Queue names should be deterministic so they
    can be retrieved. It's recommended to provide
    a helpful name.

    If the queue belongs to a top level collection,
    photos, the good name for this queue may be `"photos"`.

    If you're uploading images to an artwork, the
    best name would incoporate both `"artworks"` and
    the identifier of the artwork. A good name for this
    queue may be `"artworks/{{id}}/photos"`, where `{{id}}`
    is a dynamic segment that is generated from the artwork id.

    @property name
    @type {String}
    @default null
   */
  name: null,

  /**
    The list of files in the queue. This automatically gets
    flushed when all the files in the queue have settled.

    Note that files that have failed need to be manually
    removed from the queue. This is so they can be retried
    without resetting the state of the queue, orphaning the
    file from its queue. Upload failures can happen due to a
    timeout or a server response. If you choose to use the
    `abort` method, the file will fail to upload, but will
    be removed from the requeuing proccess, and will be
    considered to be in a settled state.

    @property files
    @type {File[]}
    @default []
   */
  files: [],

  /**
    @private

    Flushes the `files` property when they have settled. This
    will only flush files when all files have arrived at a terminus
    of their state chart.

    ```
        .------.     .---------.     .--------.
    o--| queued |-->| uploading |-->| uploaded |
        `------`     `---------`     `--------`
           ^              |    .-------.
           |              |`->| aborted |
           |              |    `-------`
           |  .------.    |    .---------.
           `-| failed |<-` `->| timed_out |-.
           |  `------`         `---------`  |
           `-------------------------------`
    ```

    Files *may* be requeued by the uesr in the `failed` or `timed_out`
    states.

    @method flushFilesWhenSettled
   */
  flushFilesWhenSettled: observer('files.@each.state', function () {
    let files = get(this, 'files');
    let allFilesHaveSettled = files.every(function (file) {
      return ['uploaded', 'aborted'].indexOf(file.state) !== -1;
    });

    if (files.length === 0) { return; }

    if (allFilesHaveSettled) {
      get(this, 'files').forEach((file) => set(file, 'queue', null));
      set(this, 'files', Ember.A());
    }
  }),

  /**
    The aggregate size (in bytes) of all files in the queue.

    @property size
    @readonly
    @type {Number}
    @default 0
   */
  size: sumBy('files.@each.size'),

  /**
    The aggregate amount of bytes that have been uploaded
    to the server for all files in the queue.

    @property loaded
    @readonly
    @type {Number}
    @default 0
   */
  loaded: sumBy('files.@each.loaded'),

  /**
    The current upload progress of the queue, as a number from 0 to 100.

    @property progress
    @readonly
    @type {Number}
    @default 0
   */
  progress: computed('size', 'loaded', {
    get() {
      let percent = (get(this, 'loaded') / get(this, 'size')) || 0;
      return Math.floor(percent * 100);
    }
  })
});
