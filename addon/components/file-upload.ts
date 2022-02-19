import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { modifier } from 'ember-modifier';
import UploadFile from 'ember-file-upload/upload-file';
import Queue from '../queue';
import FileQueueService, { DEFAULT_QUEUE } from '../services/file-queue';
import { guidFor } from '@ember/object/internals';
import { next } from '@ember/runloop';

interface FileUploadArgs {
  queue?: Queue;

  // actions
  filter?: (file: UploadFile) => boolean;

  // events
  filesSelected?: (files: UploadFile[]) => void;

  // old/deprecated API

  /** @deprecated use `queue` instead */
  name?: string;

  /**
   * @deprecated use `{{file-queue}}` helper with `{{queue.selectFile}}` modifier
   */
  multiple?: boolean;

  /**
   * @deprecated use `{{file-queue}}` helper with `{{queue.selectFile}}` modifier
   */
  disabled?: boolean;

  /**
   * @deprecated use `{{file-queue}}` helper with `{{queue.selectFile}}` modifier
   */
  accept?: string;

  /**
   * @deprecated use `{{file-queue}}` helper with `{{queue.selectFile}}` modifier
   */
  capture?: string;

  /**
   * @deprecated use `{{file-queue}}` helper with `{{queue.selectFile}}` modifier
   */
  for?: string;

  /**
   * @deprecated use `fileAdded()` instead
   */
  onFileAdd: (file: UploadFile) => void;

  // @TODO remove `onSelect` in favor of `filter()` - it never was officially
  // of public API
  /**
   * @deprecated use `filter()` instead
   */
  onSelect?: (files: UploadFile[]) => UploadFile[];
}

/**
 * `FileUpload` is a component that will users to upload files using
 * their browser's file chooser.
 *
 * @example
 *
 * old-fashioned usage:
 *
 * ```hbs
 * <FileUpload
 *   @name="photos"
 *   @accept="image/*"
 *   @multiple=true
 *   @onFileAdd={{perform this.uploadImage}}
 *   as |queue|
 * >
 *   <a tabindex="0">Add an image.</a>
 *   {{#if queue.files.length}}
 *     Uploading {{queue.files.length}} files. ({{queue.progress}}%)
 *   {{/if}}
 * </FileUpload>
 * ```
 *
 * ```js
 * import Component from '@glimmer/component';
 * import { task } from 'ember-concurrency';

 * export default class ExampleComponent extends Component {
 *   @task({ maxConcurrency: 3, enqueue: true })
 *   *uploadImage(file) {
 *     const response = yield file.upload(url, options);
 *     ...
 *   }
 * }
 * ```
 *
 * @deprecated use `{{file-queue}}` helper with `{{queue.selectFile}}` modifier
 */
export default class FileUploadComponent extends Component<FileUploadArgs> {
  @service declare fileQueue: FileQueueService;

  get queue() {
    if (this.args.queue) {
      return this.args.queue;
    }

    return this.fileQueue.findOrCreate(this.args.name ?? DEFAULT_QUEUE);
  }

  get for() {
    return this.args.for ?? `file-input-${guidFor(this)}`;
  }

  bindListeners = modifier(() => {
    this.queue.addListener(this);
    return () => this.queue.removeListener(this);
  });

  fileAdded(file: UploadFile) {
    if (this.args.onFileAdd) next(this, this.args.onFileAdd, file);
  }
}
