import Component from '@ember/component';

import { inject as service } from '@ember/service';
import {
  computed,
  get,
  setProperties,
  getProperties
} from '@ember/object';


export default Component.extend({
  /**
    Whether multiple files can be selected when uploading.
    @argument multiple
    @type {boolean}
   */
  multiple: null,

  /**
    The name of the queue to upload the file to.

    @argument name
    @type {string}
    @required
   */
  name: null,

  /**
    If set, disables input and prevents files from being added to the queue

    @argument disabled
    @type {boolean}
    @default false
   */
  disabled: false,


  /**
    A list of MIME types / extensions to be accepted by the input
    @argument accept
    @type {string}
   */
  accept: null,

  /**
    `onfileadd` is called when a file is selected.

    When multiple files are selected, this function
    is called once for every file that was selected.

    @argument onfileadd
    @type {function}
    @required
   */
  onfileadd: null,

  fileQueue: service(),

  didReceiveAttrs() {
    this._super(...arguments);
    if (get(this, 'queue')) {
      setProperties(get(this, 'queue'), getProperties(this, 'accept', 'multiple', 'disabled', 'onfileadd'));
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
