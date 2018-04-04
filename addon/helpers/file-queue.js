import Helper from '@ember/component/helper';
import { inject as service } from '@ember/service';
import { get } from '@ember/object';

/**
  `file-queue` is one of the core primitives of ember-file-upload.
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

  @param {string} [name] The name of the queue to get information on
  @return {Queue} A collection of all queues, or a specific queue.
 */
export default Helper.extend({

  fileQueue: service(),

  compute(_, hash) {
    let queues = get(this, 'fileQueue');
    let queueName = hash['name'];
    if (queueName) {
      let queue = queues.find(queueName) ||
                  queues.create(queueName);
      return queue;
    }

    return queues;
  }
});
