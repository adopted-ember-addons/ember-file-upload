import Ember from 'ember';

const { $, get } = Ember;
const { bind } = Ember.run;

let supported = (function () {
  return 'draggable' in document.createElement('span');
}());

export default Ember.Object.create({

  'for': null,

  supported,

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
      this.ondragenter(evt.dataTransfer);
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
      this.ondragleave(evt.dataTransfer);
      this._dropzoneEntrance = null;
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

    this.ondrop(evt.dataTransfer.files);
  }
});
