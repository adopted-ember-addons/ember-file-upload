import Helper from '@ember/component/helper';
import { inject as service } from '@ember/service';

/**
  `file-queue` helper is one of the core primitives of ember-file-upload.
  It has three different flavors of invocation. The first is
  a bare call, which will return the master queue:

  ```hbs
  {{#with (file-queue) as |queue|}}
    {{queue.progress}}%
  {{/with}}
  ```

  If called with a `name` property, it will return the queue
  of that name:

  ```hbs
  {{#with (file-queue name="photos") as |queue|}}
    {{queue.progress}}%
  {{/with}}
  ```

  @class FileQueue
  @param {string} [name] The name of the queue to get information on
  @return {Queue} A collection of all queues, or a specific queue.
 */
export default class FileQueueHelper extends Helper {
  @service('file-queue') fileQueue;

  compute(_, hash) {
    let queues = this.fileQueue;
    let queueName = hash['name'];
    if (queueName) {
      let queue = queues.find(queueName) || queues.create(queueName);
      return queue;
    }

    return queues;
  }
}
