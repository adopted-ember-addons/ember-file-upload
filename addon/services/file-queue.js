import { assert } from '@ember/debug';
import { A } from '@ember/array';
import Service from '@ember/service';
import Queue from '../queue';

/**
  The file queue service is a global file
  queue that manages all files being uploaded.

  This service can be used to query the current
  upload state when a user leaves the app,
  asking them whether they want to cancel
  the remaining uploads.

  @class FileQueue
  @extends Ember.Service
 */
export default class FileQueueService extends Service {
  queues = A([]);

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
  get files() {
    return this.queues.reduce((acc, queue) => {
      acc = acc.concat(queue.files);
      return acc;
    }, A([]));
  }

  /**
    Returns a queue with the given name

    @method find
    @param {String} name The name of the queue to find
    @return {Queue} The queue or null if it doesn't exist yet.
   */
  find(name) {
    return this.queues.findBy('name', name);
  }

  /**
    Create a new queue with the given name.

    @method create
    @param {String} name The name of the queue to create
    @return {Queue} The new queue.
   */
  create(name) {
    assert(
      `Queue names are required to be unique. "${name}" has already been reserved.`,
      this.find(name) == null
    );

    let queue = new Queue({ name, fileQueue: this });
    this.queues.pushObject(queue);

    return queue;
  }

  /**
    The total size of all files currently being uploaded in bytes.

    @computed size
    @type Number
    @default 0
    @readonly
    */
  get size() {
    return this.files.reduce((acc, { size }) => {
      acc += size;
      return acc;
    }, 0);
  }

  /**
    The number of bytes that have been uploaded to the server.

    @computed loaded
    @type Number
    @default 0
    @readonly
    */
  get loaded() {
    return this.files.reduce((acc, { loaded }) => {
      acc += loaded;
      return acc;
    }, 0);
  }

  /**
    The current progress of all uploads, as a percentage in the
    range of 0 to 100.

    @computed progress
    @type Number
    @default 0
    @readonly
    */
  get progress() {
    let percent = this.loaded / this.size || 0;
    return Math.floor(percent * 100);
  }
}
