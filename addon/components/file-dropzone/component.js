import Ember from 'ember';
import layout from './template';
import DataTransfer from '../../system/data-transfer';
import uuid from '../../system/uuid';

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
    let id = get(this, 'elementId');
    let handlers = this._dragHandlers = {
      dragenter: bind(this, 'didEnterDropzone'),
      dragleave: bind(this, 'didLeaveDropzone'),
      dragover:  bind(this, 'didDragOver'),
      drop:      bind(this, 'didDrop')
    };

    Object.keys(handlers).forEach(function (key) {
      $(document).on(key, `#${id}`, handlers[key]);
    });
  },

  willDestroyElement() {
    let id = get(this, 'elementId');
    let handlers = this._dragHandlers || {};
    Object.keys(handlers).forEach(function (key) {
      $(document).off(key, `#${id}`, handlers[key]);
    });

    this._dropzoneEntrance = null;
    this._super();
  },

  didEnterDropzone({ originalEvent: evt }) {
    let element = get(this, 'element');
    let entrance = this._dropzoneEntrance;

    if (entrance == null ||
        $.contains(element, entrance) ||
        element === entrance) {
      this._dropzoneEntrance = evt.target;

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
    }
  },

  didLeaveDropzone({ originalEvent: evt }) {
    let element = get(this, 'element');

    // If the element paired with the dragenter
    // event was removed from the DOM, clear it out
    // so the process can be run again.
    if (!$.contains(element, this._dropzoneEntrance) &&
        element !== this._dropzoneEntrance) {
      this._dropzoneEntrance = null;
    }

    if (evt.target === this._dropzoneEntrance) {
      if (this.ondragleave) {
        set(this[DATA_TRANSFER], 'dataTransfer', evt.dataTransfer);
        this.ondragleave(this[DATA_TRANSFER]);
        this[DATA_TRANSFER] = null;
      }
      set(this, 'active', false);
      this._dropzoneEntrance = null;
    }
  },

  didDragOver({ originalEvent: evt }) {
    set(this[DATA_TRANSFER], 'dataTransfer', evt.dataTransfer);
    evt.preventDefault();
    evt.stopPropagation();
  },

  didDrop({ originalEvent: evt }) {
    // Testing support for dragging and dropping images
    // from other browser windows
    let html, url;

    if (supportsHtml === null) {
      try {
        html = evt.dataTransfer.getData('text/html');
        supportsHtml = true;
      } catch (e) {
        supportsHtml = false;
      }
    }

    if (html) {
      let img = $(html)[1];
      if (img.tagName === 'IMG') {
        url = img.src;
      }
    }

    if (supportsUrls === null) {
      try {
        url = evt.dataTransfer.getData('text/uri-list');
        supportsUrls = true;
      } catch (e) {
        supportsUrls = false;
      }
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
            let [file] = get(this, 'queue')._addFiles([blob]);
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
          let [file] = get(this, 'queue')._addFiles([blob]);
          set(file, 'name', filename);
        }
      };
      image.onerror = function (e) {
        console.log(e);
      };
      image.src = url;
    }

    if (evt.preventDefault)  { evt.preventDefault(); }
    if (evt.stopPropagation) { evt.stopPropagation(); }
    this._dropzoneEntrance = null;

    set(this[DATA_TRANSFER], 'dataTransfer', evt.dataTransfer);
    if (this.ondrop) {
      this.ondrop(this[DATA_TRANSFER]);
    }

    // Add file(s) to upload queue.
    set(this, 'active', false);
    get(this, 'queue')._addFiles(get(this[DATA_TRANSFER], 'files'));
    this[DATA_TRANSFER] = null;
    evt.preventDefault();
    evt.stopPropagation();
  }
});
