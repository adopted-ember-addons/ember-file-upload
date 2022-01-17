import { action } from '@ember/object';
import { next } from '@ember/runloop';
import { modifier, ModifierArgs } from 'ember-modifier';
import { TrackedArray, TrackedSet } from 'tracked-built-ins';
import UploadFile, { FileSource, FileState } from './upload-file';
import FileQueueService from './services/file-queue';

export interface SelectFileModifierArgs extends ModifierArgs {
  named: {
    filter?: (file: File) => boolean;
    filesSelected?: (files: UploadFile[]) => void;
  };
}

export interface QueueListener {
  fileAdded?(file: UploadFile): void;
  fileRemoved?(file: UploadFile): void;
}

export type QueueName = string | symbol;

/**
 * The Queue is a collection of files that
 * are being manipulated by the user.
 *
 * Queues are designed to persist the state
 * of uploads when a user navigates around your
 * application.
 */
export default class Queue {
  #listeners: Set<QueueListener> = new Set();

  /**
   * The unique identifier of the queue.
   *
   * @remarks
   * Queue names should be deterministic so they
   * can be retrieved. It's recommended to provide
   * a helpful name.
   *
   * If the queue belongs to a top level collection,
   * photos, the good name for this queue may be `"photos"`.
   *
   * If you're uploading images to an artwork, the
   * best name would incoporate both `"artworks"` and
   * the identifier of the artwork. A good name for this
   * queue may be `"artworks/{{id}}/photos"`, where `{{id}}`
   * is a dynamic segment that is generated from the artwork id.
   */
  name: QueueName;

  /** The FileQueue service. */
  fileQueue: FileQueueService;

  #distinctFiles: Set<UploadFile> = new TrackedSet();

  /**
   * The list of files in the queue. This automatically gets
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
   */
  get files(): UploadFile[] {
    return [...this.#distinctFiles.values()];
  }

  // @TODO: Is this needed? I think, this is what each dropzone needs to manage
  _dropzones = new TrackedArray([]);

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
  get progress() {
    const percent = this.loaded / this.size || 0;
    return Math.floor(percent * 100);
  }

  constructor({
    name,
    fileQueue,
  }: {
    name: QueueName;
    fileQueue: FileQueueService;
  }) {
    this.name = name;
    this.fileQueue = fileQueue;
  }

  addListener(listener: QueueListener) {
    this.#listeners.add(listener);
  }

  removeListener(listener: QueueListener) {
    this.#listeners.delete(listener);
  }

  /** @deprecated use `add()` instead */
  @action
  push(file: UploadFile) {
    this.add(file);
  }

  /**
   * Add a file to the queue
   * @param file the file to be added
   */
  @action
  add(file: UploadFile) {
    if (this.#distinctFiles.has(file)) {
      return;
    }

    file.queue = this;
    this.#distinctFiles.add(file);

    for (const listener of this.#listeners) {
      listener.fileAdded?.(file);
    }
  }

  /**
   * Remove a file from the queue
   * @param file the file to be removed
   */
  @action
  remove(file: UploadFile) {
    if (!this.#distinctFiles.has(file)) {
      return;
    }

    file.queue = undefined;
    this.#distinctFiles.delete(file);

    for (const listener of this.#listeners) {
      listener.fileRemoved?.(file);
    }
  }

  /**
    @private
    @method _addFiles
    @param {FileList} fileList The event triggered from the DOM that contains a list of files
   */
  _addFiles(fileList: FileList, source: FileSource) {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const onFileAdd = this.onFileAdd;
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const disabled = this.disabled;
    const files: UploadFile[] = [];

    if (!disabled) {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      for (let i = 0, len = fileList.length || fileList.size; i < len; i++) {
        const file = fileList.item ? fileList.item(i) : fileList[i];
        if (file instanceof File) {
          const uploadFile = new UploadFile(file, source);

          files.push(uploadFile);
          this.push(uploadFile);

          if (onFileAdd) {
            next(onFileAdd, uploadFile);
          }
        }
      }
    }

    return files;
  }

  /**
   * Flushes the `files` property if they have settled. This
   * will only flush files when all files have arrived at a terminus
   * of their state chart (`uploaded` and `aborted`).
   *
   * Files *may* be requeued by the user in the `failed` or `timed_out`
   * states.
   */
  flush() {
    if (this.files.length === 0) {
      return;
    }

    const allFilesHaveSettled = this.files.every((file) => {
      return [FileState.Uploaded, FileState.Aborted].includes(file.state);
    });

    if (allFilesHaveSettled) {
      this.files.forEach((file) => (file.queue = undefined));
      this.#distinctFiles.clear();
    }
  }

  selectFile = modifier<
    HTMLInputElement,
    SelectFileModifierArgs['positional'],
    SelectFileModifierArgs['named']
  >((element, _positional, named) => {
    const changeHandler = (event: Event) => {
      const { files } = event.target as HTMLInputElement;
      if (!files) {
        return;
      }

      const selectedFiles: UploadFile[] = [];

      for (const file of files) {
        if (named.filter && !named.filter?.(file)) {
          continue;
        }

        if (file instanceof File) {
          const uploadFile = new UploadFile(file, FileSource.Browse);
          selectedFiles.push(uploadFile);

          this.add(uploadFile);
        }
      }

      named.filesSelected?.(selectedFiles);

      // this will reset the input, so the _same_ file can be picked again
      // Without, the `change` event wouldn't be fired, as it is still the same
      // value
      element.value = '';
    };
    element.addEventListener('change', changeHandler);

    return () => {
      element.removeEventListener('change', changeHandler);
    };
  });
}
