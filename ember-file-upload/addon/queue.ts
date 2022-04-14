import { action } from '@ember/object';
import { modifier } from 'ember-modifier';
import { TrackedSet } from 'tracked-built-ins';
import UploadFile from './upload-file';
import FileQueueService from './services/file-queue';
import { deprecate } from '@ember/debug';
import {
  FileSource,
  FileState,
  QueueListener,
  QueueName,
  SelectFileModifierSignature,
} from './interfaces';

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

  #name: QueueName;

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
  get name(): QueueName {
    return this.#name;
  }

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
   *
   * @defaultValue []
   */
  get files(): UploadFile[] {
    return [...this.#distinctFiles.values()];
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
    this.#name = name;
    this.fileQueue = fileQueue;
  }

  addListener(listener: QueueListener) {
    this.#listeners.add(listener);
  }

  removeListener(listener: QueueListener) {
    this.#listeners.delete(listener);
  }

  /** @deprecated Use `add()` instead. */
  @action
  push(file: UploadFile) {
    deprecate(
      `\`Queue.push\` is deprecated. Use \`Queue.add\` instead.`,
      false,
      {
        for: 'ember-file-upload',
        id: 'queue.push',
        since: { enabled: 'v5.0.0' },
        until: 'v6.0.0',
      }
    );
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
      listener.onFileAdded?.(file);
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
      listener.onFileRemoved?.(file);
    }
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

  selectFile = modifier<SelectFileModifierSignature>(
    (element, _positional, { filter, onFilesSelected }) => {
      const changeHandler = (event: Event) => {
        const { files: fileList } = event.target as HTMLInputElement;
        if (!fileList) {
          return;
        }

        const files = Array.from(fileList);
        const selectedFiles: UploadFile[] = [];

        for (const file of files) {
          if (filter && !filter?.(file, files, files.indexOf(file))) {
            continue;
          }

          let uploadFile;
          if (file instanceof File) {
            uploadFile = new UploadFile(file, FileSource.Browse);
          }
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          else if (file instanceof Blob) {
            uploadFile = UploadFile.fromBlob(file, FileSource.Browse);
          }

          if (uploadFile) {
            selectedFiles.push(uploadFile);
            this.add(uploadFile);
          }
        }

        onFilesSelected?.(selectedFiles);

        // this will reset the input, so the _same_ file can be picked again
        // Without, the `change` event wouldn't be fired, as it is still the same
        // value
        element.value = '';
      };
      element.addEventListener('change', changeHandler);

      return () => {
        element.removeEventListener('change', changeHandler);
      };
    },
    { eager: false }
  );
}
