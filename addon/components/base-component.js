import Component from '@ember/component';

import { inject as service } from '@ember/service';
import { computed, setProperties } from '@ember/object';

export default Component.extend({
  fileQueue: service(),

  didReceiveAttrs() {
    this._super(...arguments);
    if (this.queue) {
      let { accept, multiple, disabled, onfileadd } = this;
      setProperties(this.queue, { accept, multiple, disabled, onfileadd });
    }
  },

  queue: computed('name', {
    get() {
      let queueName = this.name;
      if (queueName != null) {
        let queues = this.fileQueue;
        return queues.find(queueName) || queues.create(queueName);
      } else {
        return undefined;
      }
    },
  }),
});
