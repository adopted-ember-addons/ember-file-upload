import Ember from 'ember';
import DataTransfer from './data-transfer';

const { $, get, set } = Ember;
const { bind } = Ember.run;

const DATA_TRANSFER = Symbol();

let supported = (function () {
  return 'draggable' in document.createElement('span');
}());

export default Ember.Object.extend({

  'for': null,

  supported,

  ondragenter: null,

  ondragleave: null,

  queue: null,

  init() {
    this._super();
    let id = get(this, 'for');
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

  destroy() {
    let id = get(this, 'for');
    let handlers = this._dragHandlers || {};
    Object.keys(handlers).forEach(function (key) {
      $(document).off(key, `#${id}`, handlers[key]);
    });

    this._dropzoneEntrance = null;
    this._super();
  },

  didEnterDropzone({ originalEvent: evt }) {
    if (this._dropzoneEntrance == null) {
      this._dropzoneEntrance = evt.target;

      let dataTransfer = DataTransfer.create({
        dataTransfer: evt.dataTransfer
      });
      this[DATA_TRANSFER] = dataTransfer;

      set(this, 'active', true);
      set(this, 'valid', get(dataTransfer, 'valid'));
      this.recompute();

      if (this.ondragenter) {
        this.ondragenter(dataTransfer);
      }
    }
  },

  didLeaveDropzone({ originalEvent: evt }) {
    let element = document.getElementById(get(this, 'for'));

    // If the element paired with the dragenter
    // event was removed from the DOM, clear it out
    // so the process can be run again.
    if (!$.contains(element, this._dropzoneEntrance)) {
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
      this.recompute();
    }
  },

  didDragOver({ originalEvent: evt }) {
    evt.preventDefault();
    evt.stopPropagation();
  },

  didDrop({ originalEvent: evt }) {
    if (evt.preventDefault)  { evt.preventDefault(); }
    if (evt.stopPropagation) { evt.stopPropagation(); }
    this._dropzoneEntrance = null;

    set(this[DATA_TRANSFER], 'dataTransfer', evt.dataTransfer);
    if (this.ondrop) {
      this.ondrop(this[DATA_TRANSFER]);
    }

    set(this, 'active', false);
    get(this, 'queue')._addFiles(get(this[DATA_TRANSFER], 'files'));
    this.recompute();
    this[DATA_TRANSFER] = null;
  },

  /**
    Render a helpful warning when calling toString() on
    a dropzone, since it should always be used with the `{{#with}}`
    helper.
   */
  toString() {
    return `
      You're using {{#file-dropzone}} as a helper instead of a sub-expression.
      It's recommended to use file-dropzone as a sub-expression:

      {{#with (file-dropzone for="app" queue=(file-queue for="designs")) as |dropzone|}}
        {{! Your dropzone display logic goes here }}
      {{/with}}
    `;
  }
});
