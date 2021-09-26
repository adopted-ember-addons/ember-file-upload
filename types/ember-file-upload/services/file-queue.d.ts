import File from 'ember-file-upload/file';
import Queue from 'ember-file-upload/queue';

export default class FileQueue {
  /**
   * The list of all files in queues. This automatically gets flushed when all the files in the queue have settled.
   *
   * Note that files that have failed need to be manually removed from the queue. This is so they can be retried
   * without resetting the state of the queue, orphaning the file from its queue. Upload failures can happen due
   * to a timeout or a server response. If you choose to use the abort method, the file will fail to upload, but
   * will be removed from the requeuing proccess, and will be considered to be in a settled state.
   */
  files: File[];

  /**
   * The number of bytes that have been uploaded to the server.
   */
  loaded: number;

  /**
   * The current progress of all uploads, as a percentage in the range of 0 to 100.
   */
  progress: number;

  /**
   * The total size of all files currently being uploaded in bytes.
   */
  size: number;

  /**
   * Flushes the files property if they have settled. This will only flush files when all files have arrived at a
   * terminus of their state chart. Files may be requeued by the user in the failed or timed_out states.
   */
  flush(): any;

  /**
   * Returns a queue with the given name
   * @param name The name of the queue to find
   */
  find(name: string): Queue;

  /**
   * Create a new queue with the given name.
   * @param name The name of the queue to create
   */
  create(name: string): Queue;
}
