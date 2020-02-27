import Mixin from '@ember/object/mixin';
import { A } from '@ember/array';
import { computed, set, get } from '@ember/object';
import sumBy from '../computed/sum-by';

export default Mixin.create({
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

    @type {function}
   */
  flush() {
    let fileQueue = get(this, 'fileQueue');

    if (fileQueue) {
      fileQueue.flush();
    }

    let files = get(this, 'files');

    if (files.length === 0) { return; }

    let allFilesHaveSettled = files.every((file) => {
      return ['uploaded', 'aborted'].includes(file.state);
    });

    if (allFilesHaveSettled) {
      get(this, 'files').forEach((file) => set(file, 'queue', null));
      set(this, 'files', A());
    }
  },

  /**
    The total size of all files currently being uploaded in bytes.

    @computed size
    @type Number
    @default 0
    @readonly
   */
  size: sumBy('files', 'size'),

  /**
    The number of bytes that have been uploaded to the server.

    @computed loaded
    @type Number
    @default 0
    @readonly
   */
  loaded: sumBy('files', 'loaded'),

  /**
    The current progress of all uploads, as a percentage in the
    range of 0 to 100.

    @computed progress
    @type Number
    @default 0
    @readonly
   */
  progress: computed('size', 'loaded', {
    get() {
      let percent = get(this, 'loaded') / get(this, 'size') || 0;
      return Math.floor(percent * 100);
    }
  })
});
