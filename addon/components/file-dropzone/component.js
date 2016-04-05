import Ember from 'ember';
import File from '../../file';
import DragAndDrop from '../../mixins/drag-and-drop';
import layout from './template';
import trim from '../../system/trim';

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
      get(queue, 'onfileadd')(file, queue);
    });
  },

  filter(fileList) {
    let files = [];
    if (!get(this, 'multiple') && fileList.length > 1) {
      files.push(fileList[0]);
    } else {
      for (let i = 0, len = fileList.length; i < len; i++) {
        files.push(fileList[i]);
      }
    }

    let tokens = get(this, 'queue.accepts').split(',').map(function (token) {
      return trim(token).toLowerCase();
    });
    let extensions = tokens.filter(function (token) {
      return token.indexOf('.') === 0;
    });
    let mimeTypes = tokens.filter(function (token) {
      return token.indexOf('.') !== 0;
    });

    return files.filter(function (file) {
      let extension = file.name.toLowerCase().match(/(\.[^.]+)$/)[1];
      return mimeTypes.indexOf(file.type.toLowerCase()) !== -1 ||
             extensions.indexOf(extension) !== -1;
    })
  },

  actions: {
    dragEnter(dataTransfer) {
      let dragEnter = get(this, 'ondragenter');
      set(this, 'active', true);
      if (dragEnter) {
        // Create DataTransfer Object;
        // This is a queue of files to be pushed into
        // the parent queue; it should provide the ability
        // to validate the incoming files and to set
        // the drop effect
        let files = this.filter(dataTransfer.files);
        set(this, 'valid', dragEnter(dataTransfer));
      }
    },

    dragLeave(dragTransfer) {
      let dragLeave = get(this, 'ondragleave');
      set(this, 'active', true);
      dragLeave && dragLeave(dataTransfer);
    },

    drop(files) {
      this.addFiles(files);
    }
  }
});
