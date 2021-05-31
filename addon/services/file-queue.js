import { assert } from '@ember/debug';
import { A } from '@ember/array';
import Service from '@ember/service';
import { once } from '@ember/runloop';
import Queue from '../queue';
import WithFiles from '../mixins/with-files';

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
export default class FileQueueService extends Service.extend(WithFiles) {
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
  files = A([]);

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

    let queue = Queue.create({ name, fileQueue: this });
    this.queues.push(queue);
    once(this, 'notifyPropertyChange', 'queues');

    return queue;
  }
}
