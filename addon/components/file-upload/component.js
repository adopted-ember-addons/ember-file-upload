import Ember from 'ember';
import File from '../../file';
import layout from './template';

const { get } = Ember;

export default Ember.Component.extend({
  tagName: 'label',
  classNames: ['file-upload'],

  layout,

  queue: null,

  addFiles(fileList) {
    let files = [];

    for (let i = 0, len = fileList.length; i < len; i++) {
      files.push(File.fromBlob(fileList.item(i)));
    }

    let queue = get(this, 'queue');
    let onfileadd = get(queue, 'onfileadd');
    files.forEach((file) => {
      queue.pushObject(file);
      onfileadd(file, queue);
    });
  },

  actions: {
    change(files) {
      this.addFiles(files);
    }
  }
});
