import { assert } from '@ember/debug';
import Service from '@ember/service';
import { registerDestructor } from '@ember/destroyable';
import { tracked } from 'tracked-built-ins';

import Queue, { QueueName } from '../queue';
import File from '../file';

export const DEFAULT_QUEUE = Symbol('DEFAULT_QUEUE');

/**
 * The file queue service is a global file
 * queue that manages all files being uploaded.
 *
 * This service can be used to query the current
 * upload state when a user leaves the app,
 * asking them whether they want to cancel
 * the remaining uploads.
 */
export default class FileQueueService extends Service {
  queues: Map<QueueName, Queue> = tracked(new Map());

  /**
   * Returns a queue with the given name
   *
   * @param name The name of the queue to find
   * @returns The queue if it exists
   */
  find(name: QueueName): Queue | undefined {
    return this.queues.get(name);
  }

  /**
   * Create a new queue with the given name.
   *
   * @param name The name of the queue to create
   * @returns The new queue.
   */
  create(name: QueueName): Queue {
    assert(
      `Queue names are required to be unique. "${String(
        name
      )}" has already been reserved.`,
      !this.queues.has(name)
    );

    const queue = new Queue({ name, fileQueue: this });

    registerDestructor(queue, () => {
      this.queues.delete(name);
    });

    this.queues.set(name, queue);
    return queue;
  }

  findOrCreate(name: QueueName): Queue {
    return this.find(name) ?? this.create(name);
  }

  //
  // @TODO
  // Everything below this line should be deprecated ?
  // -------------------------------------------------
  //

  /**
   * The list of all files in queues. This automatically gets
   * flushed when all the files in the queue have settled.
   *
   * @remarks
   * Note that files that have failed need to be manually
   * removed from the queue. This is so they can be retried
   * without resetting the state of the queue, orphaning the
   * file from its queue. Upload failures can happen due to a
   * timeout or a server response. If you choose to use the
   * `abort` method, the file will fail to upload, but will
   * be removed from the requeuing proccess, and will be
   * considered to be in a settled state.
   *
   * @defaultValue []
   */
  get files(): File[] {
    return [...this.queues.values()].reduce((acc, queue) => {
      return [...acc, ...queue.files];
    }, []);
  }

  /**
   * The total size of all files currently being uploaded in bytes.
   *
   * @defaultValue 0
   */
  get size(): number {
    return this.files.reduce((acc, { size }) => {
      return acc + size;
    }, 0);
  }

  /**
   * The number of bytes that have been uploaded to the server.
   *
   * @defaultValue 0
   */
  get loaded(): number {
    return this.files.reduce((acc, { loaded }) => {
      return acc + loaded;
    }, 0);
  }

  /**
   * The current progress of all uploads, as a percentage in the
   * range of 0 to 100.
   *
   * @defaultValue 0
   */
  get progress(): number {
    const percent = this.loaded / this.size || 0;
    return Math.floor(percent * 100);
  }
}

declare module '@ember/service' {
  interface Registry {
    'file-queue': FileQueueService;
  }
}
