import Component from '@ember/component';

import { inject as service } from '@ember/service';
import {
  computed,
  get,
  setProperties,
  getProperties
} from '@ember/object';

export default Component.extend({
  fileQueue: service(),

  didReceiveAttrs() {
    this._super(...arguments);
    if (get(this, 'queue')) {
      setProperties(get(this, 'queue'), getProperties(this, 'accept', 'multiple', 'disabled', 'onFileAdd'));
    }
  },

  queue: computed('name', {
    get() {
      let queueName = get(this, 'name');
      if (queueName != null) {
        let queues = get(this, 'fileQueue');
        return queues.find(queueName) ||
               queues.create(queueName);
      }
    }
  })
});
