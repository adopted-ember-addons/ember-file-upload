import Ember from 'ember';
import layout from './template';
import DataTransfer from '../../system/data-transfer';
import uuid from '../../system/uuid';
import DragListener from '../../system/drag-listener';

const { $, get, set, computed } = Ember;
const { bind } = Ember.run;
const { service } = Ember.inject;

const DATA_TRANSFER = 'DATA_TRANSFER' + uuid.short();

let supported = (function () {
  return typeof window !== 'undefined' && window.document &&
         'draggable' in document.createElement('span');
}());

let supportsHtml = null;
let supportsUrls = null;

const dragListener = new DragListener();

export default Ember.Component.extend({

  layout,

  name: null,

  supported,

  ondragenter: null,

  ondragleave: null,

  fileQueue: service(),

  queue: computed('name', {
    get() {
      let queueName = get(this, 'name');
      let queues = get(this, 'fileQueue');
      return queues.find(queueName) ||
             queues.create(queueName);
    }
  }),

  didInsertElement() {
    this._super();

    dragListener.addEventListeners(`#${get(this, 'elementId')}`, {
      dragenter: bind(this, 'didEnterDropzone'),
      dragleave: bind(this, 'didLeaveDropzone'),
      dragover:  bind(this, 'didDragOver'),
      drop:      bind(this, 'didDrop')
    });
  },

  willDestroyElement() {
    dragListener.removeEventListeners(`#${get(this, 'elementId')}`);
  },

  didEnterDropzone(evt) {
    let dataTransfer = DataTransfer.create({
      queue: get(this, 'queue'),
      dataTransfer: evt.dataTransfer
    });
    this[DATA_TRANSFER] = dataTransfer;

    set(this, 'active', true);
    set(this, 'valid', get(dataTransfer, 'valid'));

    if (this.ondragenter) {
      this.ondragenter(dataTransfer);
    }
  },

  didLeaveDropzone(evt) {
    if (this.ondragleave) {
      set(this[DATA_TRANSFER], 'dataTransfer', evt.dataTransfer);
      this.ondragleave(this[DATA_TRANSFER]);
      this[DATA_TRANSFER] = null;
    }
    if (!this.isDestroyed) {
      set(this, 'active', false);
    }
  },

  didDragOver(evt) {
    set(this[DATA_TRANSFER], 'dataTransfer', evt.dataTransfer);
  },

  didDrop(evt) {
    // Testing support for dragging and dropping images
    // from other browser windows
    let url;

    if (supportsHtml === null) {
      try {
        evt.dataTransfer.getData('text/html');
        supportsHtml = true;
      } catch (e) {
        supportsHtml = false;
      }
    }

    if (supportsHtml) {
      let html = evt.dataTransfer.getData('text/html');
      if (html) {
        let img = $(html)[1];
        if (img.tagName === 'IMG') {
          url = img.src;
        }
      }
    }

    if (supportsUrls === null) {
      try {
        evt.dataTransfer.getData('text/uri-list');
        supportsUrls = true;
      } catch (e) {
        supportsUrls = false;
      }
    }

    if (supportsUrls) {
      url = evt.dataTransfer.getData('text/uri-list');
    }

    if (url) {
      var image = new Image();
      var [filename] = url.split('/').slice(-1);
      image.crossOrigin = 'anonymous';
      image.onload = () => {
        var canvas = document.createElement('canvas');
        canvas.width = image.width;
        canvas.height = image.height;

        var ctx = canvas.getContext('2d');
        ctx.drawImage(image, 0, 0);

        if (canvas.toBlob) {
          canvas.toBlob((blob) => {
            let [file] = get(this, 'queue')._addFiles([blob], 'web');
            set(file, 'name', filename);
          });
        } else {
          let binStr = atob(canvas.toDataURL().split(',')[1]),
              len = binStr.length,
              arr = new Uint8Array(len);

          for (var i=0; i<len; i++ ) {
            arr[i] = binStr.charCodeAt(i);
          }
          let blob = new Blob([arr], { type: 'image/png' });
          blob.name = filename;
          let [file] = get(this, 'queue')._addFiles([blob], 'web');
          set(file, 'name', filename);
        }
      };
      image.onerror = function (e) {
        console.log(e);
      };
      image.src = url;
    }

    set(this[DATA_TRANSFER], 'dataTransfer', evt.dataTransfer);
    if (this.ondrop) {
      this.ondrop(this[DATA_TRANSFER]);
    }

    // Add file(s) to upload queue.
    set(this, 'active', false);
    get(this, 'queue')._addFiles(get(this[DATA_TRANSFER], 'files'), 'drag-and-drop');
    this[DATA_TRANSFER] = null;
  }
});
