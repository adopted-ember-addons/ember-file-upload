import Ember from 'ember';
import File from '../../file';
import DragAndDrop from '../../mixins/drag-and-drop';
import layout from './template';

const { get } = Ember;

export default Ember.Component.extend(DragAndDrop, {
  classNames: ['file-dropzone'],

  layout,

  queue: null,

  ondragenter: null,
  ondragleave: null,

  addFiles(fileList) {
    let files = [];

    for (let i = 0, len = fileList.length; i < len; i++) {
      files.push(File.fromBlob(fileList.item(i)));
    }

    let queue = get(this, 'queue');
    files.forEach(function (file) {
      queue.pushObject(file);
    });

    files.forEach((file) => {
      get(this, 'queue.onfileadd')(file, queue);
    });
  },

  actions: {
    dragEnter(evt) {
      get(this, 'ondragenter')(evt.dataTransfer);
    },

    dragLeave(evt) {
      get(this, 'ondragleave')(evt.dataTransfer);
    },

    drop(evt) {
      this.addFiles(evt.originalEvent.dataTransfer.files);
    }
  }
});
