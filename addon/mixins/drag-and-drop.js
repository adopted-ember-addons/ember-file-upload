import Ember from 'ember';

const { $, get, on } = Ember;
const { bind } = Ember.run;

const DragAndDrop = Ember.Mixin.create({
  _bindEventHandlers: on('didInsertElement', function () {
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
  }),

  teardownDragListeners: on('willDestroyElement', function () {
    let id = get(this, 'elementId');
    let handlers = this._dragHandlers || {};
    Object.keys(handlers).forEach(function (key) {
      $(document).off(key, `#${id}`, handlers[key]);
    });

    this._dropzoneEntrance = null;
  }),

  didEnterDropzone({ originalEvent: evt }) {
    if (this._dropzoneEntrance == null) {
      this._dropzoneEntrance = evt.target;
      this.send('dragEnter', evt.dataTransfer);
    }
  },

  didLeaveDropzone({ originalEvent: evt }) {
    // If the element paired with the dragenter
    // event was removed from the DOM, clear it out
    // so the process can be run again.
    if (!$.contains(get(this, 'element'), this._dropzoneEntrance)) {
      this._dropzoneEntrance = null;
    }

    if (evt.target === this._dropzoneEntrance) {
      this.send('dragLeave', evt.dataTransfer);
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

    this.send('drop', evt.dataTransfer);
  }
});

DragAndDrop.supported = (function () {
  return 'draggable' in document.createElement('span');
}());

export default DragAndDrop;
