import Ember from 'ember';

const { $, on } = Ember;
const { bind } = Ember.run;

const DragAndDrop = Ember.Mixin.create({
  _bindEventHandlers: on('didInsertElement', function () {
    let dropzoneId = get(this, 'for-dropzone');
    if (dropzoneId) {
      let handlers = this._dragHandlers = {
        dragenter: bind(this, 'didEnterDropzone'),
        dragleave: bind(this, 'didLeaveDropzone'),
        drop:      bind(this, 'didDrop')
      };

      Object.keys(handlers).forEach(function (key) {
        $(document).on(key, `#${dropzoneId}`, handlers[key]);
      });

      this._dragMutex = 0;
    }
  }),

  teardownDragListeners: on('willDestroyElement', function () {
    let handlers = this._dragHandlers || {};
    keys(handlers).forEach(function (key) {
      $(document).off(key, `#${dropzoneId}`, handlers[key]);
    });

    this._dragHandlers = null;
  }),

  didEnterDropzone({ originalEvent: evt }) {
    if (evt.preventDefault)  { evt.preventDefault(); }
    if (evt.stopPropagation) { evt.stopPropagation(); }

    if (this._dragMutex === 0) {
      this.send('dragEnter', evt.dataTransfer);
    }
    this._dragMutex++;
  },

  didLeaveDropzone({ originalEvent: evt }) {
    if (evt.preventDefault)  { evt.preventDefault(); }
    if (evt.stopPropagation) { evt.stopPropagation(); }
    this._dragMutex--;

    if (this._dragMutex === 0) {
      this.send('dragLeave', evt.dataTransfer);
    }
  },

  didDrop({ originalEvent: evt }) {
    if (evt.preventDefault)  { evt.preventDefault(); }
    if (evt.stopPropagation) { evt.stopPropagation(); }
    this._dragMutex = 0;

    this.send('drop', evt);
  }
});

DragAndDrop.supported = (function () {
  return 'draggable' in document.createElement('span');
}());

export default DragAndDrop;
