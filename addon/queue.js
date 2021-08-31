import { A } from '@ember/array';
import { next } from '@ember/runloop';
import File from './file';

/**
  The Queue is a collection of files that
  are being manipulated by the user.

  Queues are designed to persist the state
  of uploads when a user navigates around your
  application.

  @class Queue
 */
export default class Queue {
  constructor({ name, fileQueue }) {
    this.name = name;
    this.fileQueue = fileQueue;
    this.files = A();
    this._dropzones = A();
  }

  destroy() {
    this.fileQueue.queues.delete(this.name);
    this.files.forEach((file) => (file.queue = null));
    this.files = A();
  }

  /**
    The FileQueue service.

    @property fileQueue
    @type FileQueue
   */
  fileQueue = null;

  /**
    @method push
    @param {File} file The file to append to the queue
   */
  push(file) {
    file.queue = this;
    this.files.pushObject(file);
  }

  /**
    @private
    @method _addFiles
    @param {FileList} fileList The event triggered from the DOM that contains a list of files
   */
  _addFiles(fileList, source) {
    let onFileAdd = this.onFileAdd;
    let disabled = this.disabled;
    let files = [];

    if (!disabled) {
      for (let i = 0, len = fileList.length || fileList.size; i < len; i++) {
        let fileBlob = fileList.item ? fileList.item(i) : fileList[i];
        if (fileBlob instanceof Blob) {
          let file = File.fromBlob(fileBlob, source);

          files.push(file);
          this.push(file);

          if (onFileAdd) {
            next(onFileAdd, file);
          }
        }
      }
    }

    return files;
  }

  /**
    @method remove
    @param {File} file The file to remove from the queue.
   */
  remove(file) {
    file.queue = null;
    this.files.removeObject(file);
  }

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
    @type string
    @default null
   */
  name = null;

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
    @type File[]
    @default []
   */
  files = null;

  /**
    Flushes the `files` property if they have settled. This
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

    Files *may* be requeued by the user in the `failed` or `timed_out`
    states.

    @method flush
   */
  flush() {
    let files = this.files;

    if (files.length === 0) {
      return;
    }

    let allFilesHaveSettled = files.every((file) => {
      return ['uploaded', 'aborted'].includes(file.state);
    });

    if (allFilesHaveSettled) {
      this.files.forEach((file) => (file.queue = null));
      this.files = A();
    }
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
