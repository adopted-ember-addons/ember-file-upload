import { assert } from '@ember/debug';
import { A } from '@ember/array';
import Service from '@ember/service';
import { observer, computed, set, get } from '@ember/object';
import { once } from '@ember/runloop';
import Queue from '../queue';
import sumBy from '../computed/sum-by';

/**
  The file queue service is a global file
  queue that manages all files being uploaded.

  This service can be used to query the current
  upload state when a user leaves the app,
  asking them whether they want to cancel
  the remaining uploads.

  @class file-queue
  @extends Ember.Service
 */
export default Service.extend({

  /**
    @private
    @constructor
    @method
    Setup a map of uploaders so they may be
    accessed by name via the `find` method.
   */
  init() {
    set(this, 'queues', A());
    set(this, 'files', A());
  },

  /**
    The list of all files in queues. This automatically gets
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
  files: null,

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
      set(this, 'files', A());
    }
  }),

  /**
    The total size of all files currently being uploaded in bytes.

    @property size
    @type Number
    @default 0
    @readonly
   */
  size: sumBy('files', 'size'),

  /**
    The number of bytes that have been uploaded to the server.

    @property loaded
    @type Number
    @default 0
    @readonly
   */
  loaded: sumBy('files', 'loaded'),

  /**
    The current progress of all uploads, as a percentage in the
    range of 0 to 100.

    @property progress
    @type Number
    @default 0
    @readonly
   */
  progress: computed('size', 'loaded', {
    get() {
      let percent = get(this, 'loaded') / get(this, 'size') || 0;
      return Math.floor(percent * 100);
    }
  }),

  /**
    Returns a queue with the given name

    @method find
    @param {String} name The name of the queue to find
    @return {Queue} The queue or null if it doesn't exist yet.
   */
  find(name) {
    return get(this, 'queues').findBy('name', name);
  },

  /**
    Create a new queue with the given name.

    @method create
    @param {String} name The name of the queue to create
    @return {Queue} The new queue.
   */
  create(name) {
    assert(`Queue names are required to be unique. "${name}" has already been reserved.`, this.find(name) == null);

    let queue = Queue.create({ name, fileQueue: this });
    get(this, 'queues').push(queue);
    once(this, 'notifyPropertyChange', 'queues');

    return queue;
  }
});
