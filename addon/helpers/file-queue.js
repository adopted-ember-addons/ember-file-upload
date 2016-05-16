import Ember from 'ember';

const { get } = Ember;
const { service } = Ember.inject;

/**
  `file-queue` is one of the core primitives of ember-file-upload.
  It has three different flavors of invocation. The first is
  a bare call, which will return the master queue:

  ```handlebars
  {{#with (file-queue) as |queue|}}
    {{queue.progress}}%
  {{/with}}
  ```

  If called with a `for` property, it will return the queue
  of that name:

  ```handlebars
  {{#with (file-queue for="photos") as |queue|}}
    {{queue.progress}}%
  {{/with}}
  ```

  And if there are more attributes passed in, it will
  configure the queue with additional information that
  will handle lifecycle hooks and validation:

  ```handlebars
  {{#file-upload queue=(file-queue for="photos"
                                   multiple=true
                                   accept="image/*"
                                   onfileadd=(action "uploadImage"))
    Add Photo
  {{/file-upload}}
  ```

  @public
  @method file-queue
  @return {Queue} A collection of all queues, or a specific queue.
  @for Helpers
 */
export default Ember.Helper.extend({

  fileQueue: service(),

  compute(_, hash) {
    let queues = get(this, 'fileQueue');
    let queueName = hash['for'];
    if (queueName) {
      delete hash['for'];
      let queue = queues.find(queueName) ||
                  queues.create(queueName);
      queue.setProperties(hash);
      return queue;
    }

    return queues;
  }
});
