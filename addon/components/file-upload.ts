import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';

import uuid from '../system/uuid';
import File from '../file';
import Queue from '../queue';
import FileQueueService, { DEFAULT_QUEUE } from '../services/file-queue';

interface FileUploadArgs {
  name?: string;
  queue?: Queue;

  // actions
  filter?: (file: File) => boolean;

  // events
  filesSelected?: (files: File[]) => void;

  // old/deprecated API

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
  onFileAdd: (file: File) => void;

  // @TODO remove `onSelect` in favor of `filter()` - it never was officially
  // of public API
  /**
   * @deprecated use `filter()` instead
   */
  onSelect?: (files: File[]) => File[];
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
 *
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

    if (this.args.name) {
      return this.fileQueue.findOrCreate(this.args.name);
    }

    return this.fileQueue.findOrCreate(DEFAULT_QUEUE);
  }

  get for() {
    return this.args.for || `file-input-${uuid.short()}`;
  }

  @action
  attachListeners() {
    this.queue.addListener(this);
  }

  fileAdded(file: File) {
    this.args.onFileAdd?.(file);
  }
}
