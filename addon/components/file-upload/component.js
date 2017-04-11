import Ember from 'ember';
import layout from './template';
import uuid from '../../system/uuid';

const { get, computed, setProperties, getProperties } = Ember;
const { service } = Ember.inject;

const VALID_TAGS = ['a', 'abbr', 'area', 'audio', 'b', 'bdo', 'br', 'canvas', 'cite',
                    'code', 'command', 'datalist', 'del', 'dfn', 'em', 'embed', 'i',
                    'iframe', 'img', 'kbd', 'mark', 'math', 'noscript', 'object', 'q',
                    'ruby', 'samp', 'script', 'small', 'span', 'strong', 'sub', 'sup',
                    'svg', 'time', 'var', 'video', 'wbr',
                    'path', 'g', 'use'];

export default Ember.Component.extend({
  tagName: 'label',
  classNames: ['file-upload'],

  attributeBindings: ['for'],

  for: computed({
    get() {
      return `file-input-${uuid.short()}`;
    }
  }),

  layout,

  name: null,

  fileQueue: service(),

  didReceiveAttrs() {
    if (get(this, 'queue')) {
      setProperties(get(this, 'queue'), getProperties(this, 'accept', 'multiple', 'onfileadd'));
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
  }),

  didInsertElement() {
    let id = get(this, 'for');
    Ember.assert(`Changing the tagName of {{file-upload}} to "${get(this, 'tagName')}" will break interactions.`, get(this, 'tagName') === 'label');
    this.$('*').each(function (_, element) {
      if (element.id !== id &&
          VALID_TAGS.indexOf(element.tagName.toLowerCase()) === -1) {
        Ember.assert(`"${element.outerHTML}" is not allowed as a child of {{file-upload}}.`);
      }
    });
  },

  actions: {
    change(files) {
      get(this, 'queue')._addFiles(files, 'browse');
    }
  }
});
