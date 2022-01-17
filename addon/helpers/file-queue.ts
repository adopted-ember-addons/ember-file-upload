import Helper from '@ember/component/helper';
import { registerDestructor } from '@ember/destroyable';
import { inject as service } from '@ember/service';
import UploadFile from '../upload-file';
import { QueueListener } from '../queue';
import type FileQueueService from '../services/file-queue';
import { DEFAULT_QUEUE } from '../services/file-queue';

interface FileQueueArgs {
  name?: string;
  fileAdded?: (file: UploadFile) => void;
  fileRemoved?: (file: UploadFile) => void;
}

/**
 * `file-queue` helper is one of the core primitives of ember-file-upload.
 *
 * @example
 *
 * using the default queue (no `name` property)
 *
 * ```hbs
 * {{#with (file-queue) as |queue|}}
 *   {{queue.progress}}%
 * {{/with}}
 * ```
 *
 * @example
 *
 * named queue:
 *
 * ```hbs
 * {{#with (file-queue name="photos") as |queue|}}
 *   {{queue.progress}}%
 * {{/with}}
 * ```
 */
export default class FileQueueHelper extends Helper implements QueueListener {
  @service declare fileQueue: FileQueueService;

  declare args: FileQueueArgs;

  compute(_positional: unknown[], args: FileQueueArgs) {
    this.args = args;
    const queue = args.name
      ? this.fileQueue.findOrCreate(args.name)
      : this.fileQueue.findOrCreate(DEFAULT_QUEUE);

    queue.addListener(this);

    registerDestructor(this, () => {
      queue.removeListener(this);
    });

    return queue;
  }

  fileAdded(file: UploadFile) {
    this.args.fileAdded?.(file);
  }

  fileRemoved(file: UploadFile) {
    this.args.fileRemoved?.(file);
  }
}
