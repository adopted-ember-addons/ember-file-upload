import FileQueue from './services/file-queue';

export default class Queue {
  /**
   * The FileQueue service
   */
  fileQueue: FileQueue;

  /**
   * The unique identifier of the queue.
   *
   * Queue names should be deterministic so they can be retrieved. It's recommended to provide a helpful name.
   *
   * If the queue belongs to a top level collection, photos, the good name for this queue may be "photos".
   *
   * If you're uploading images to an artwork, the best name would incoporate both "artworks" and the identifier of the
   * artwork. A good name for this queue may be "artworks/{{id}}/photos", where {{id}} is a dynamic segment that is
   * generated from the artwork id.
   */
  name: string;

  /**
   * The list of files in the queue. This automatically gets flushed when all the files in the queue have settled.
   *
   * Note that files that have failed need to be manually removed from the queue. This is so they can be retried
   * without resetting the state of the queue, orphaning the file from its queue. Upload failures can happen due to
   * a timeout or a server response. If you choose to use the abort method, the file will fail to upload, but will be
   * removed from the requeuing proccess, and will be considered to be in a settled state.
   */
  files: File[];

  /**
   *
   * @param file The file to append to the queue
   */
  push(file: File): any;

  /**
   *
   * @param file The file to remove from the queue.
   */
  remove(file: File): any;
}
