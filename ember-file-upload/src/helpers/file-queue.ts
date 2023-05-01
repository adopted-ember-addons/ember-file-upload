import Helper from '@ember/component/helper';
import { registerDestructor } from '@ember/destroyable';
import { inject as service } from '@ember/service';
import type { UploadFile } from '../upload-file';
import type FileQueueService from '../services/file-queue';
import { DEFAULT_QUEUE } from '../services/file-queue';
import { FileQueueArgs, QueueListener } from '../interfaces';

/**
 * `file-queue` helper is one of the core primitives of ember-file-upload.
 *
 * @example
 *
 * using the default queue (no `name` property)
 *
 * ```hbs
 * {{#let (file-queue) as |queue|}}
 *   {{queue.progress}}%
 * {{/let}}
 * ```
 *
 * @example
 *
 * named queue:
 *
 * ```hbs
 * {{#let (file-queue name="photos") as |queue|}}
 *   {{queue.progress}}%
 * {{/let}}
 * ```
 */
export default class FileQueueHelper extends Helper implements QueueListener {
  @service declare fileQueue: FileQueueService;

  declare args: FileQueueArgs;

  compute(_positional: unknown[], args: FileQueueArgs) {
    this.args = args;
    const queue = this.fileQueue.findOrCreate(args.name ?? DEFAULT_QUEUE);

    queue.addListener(this);

    registerDestructor(this, () => {
      queue.removeListener(this);
    });

    return queue;
  }

  onFileAdded(file: UploadFile) {
    this.args.onFileAdded?.(file);
  }

  onFileRemoved(file: UploadFile) {
    this.args.onFileRemoved?.(file);
  }

  onUploadStarted(file: UploadFile) {
    this.args.onUploadStarted?.(file);
  }

  onUploadSucceeded(file: UploadFile, response: Response) {
    this.args.onUploadSucceeded?.(file, response);
  }

  onUploadFailed(file: UploadFile, response: Response) {
    this.args.onUploadFailed?.(file, response);
  }
}
