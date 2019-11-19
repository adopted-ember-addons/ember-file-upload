/* global Blob, Uint8Array */
import BaseComponent from '../base-component';

import { bind } from '@ember/runloop';
import { set, get } from '@ember/object';
import { getOwner } from '@ember/application';
import layout from './template';
import DataTransfer from '../../system/data-transfer';
import uuid from '../../system/uuid';
import parseHTML from '../../system/parse-html';
import DragListener from '../../system/drag-listener';

const DATA_TRANSFER = 'DATA_TRANSFER' + uuid.short();

let supported = (function () {
  return typeof window !== 'undefined' && window.document &&
         'draggable' in document.createElement('span');
}());

const dragListener = new DragListener();

/**
  `FileDropzone` is a component that will allow users to upload files by
   drag and drop.

  ```hbs
  <FileDropzone @name="photos" as |dropzone queue|>
    {{#if dropzone.active}}
      {{#if dropzone.valid}}
        Drop to upload
      {{else}}
        Invalid
      {{/if}}
    {{else if queue.files.length}}
      Uploading {{queue.files.length}} files. ({{queue.progress}}%)
    {{else}}
      <h4>Upload Images</h4>
      <p>
        {{#if dropzone.supported}}
          Drag and drop images onto this area to upload them or
        {{/if}}
        <FileUpload @name="photos"
                    accept="image/*"
                    multiple=true
                    @onfileadd={{action "uploadImage"}}>
          <a id="upload-image" tabindex=0>Add an Image.</a>
        </FileUpload>
      </p>
    {{/if}}
  </FileDropzone>
  ```

  ```js
  import Controller from '@ember/controller';

  export default Ember.Route.extend({
    actions: {
      uploadImage(file) {
       file.upload(URL, options).then((response) => {
          ...
       });
      }
    }
  });
  ```

  @class FileDropzone
  @type Ember.Component
  @yield {Hash} dropzone
  @yield {boolean} dropzone.supported
  @yield {boolean} dropzone.active
  @yield {boolean} dropzone.valid
  @yield {Queue} queue
 */
export default BaseComponent.extend({

  layout,

  supported,
  active: false,
  valid: true,

  /**
    Whether multiple files can be selected when uploading.
    @argument multiple
    @type {boolean}
   */
  multiple: null,

  /**
    The name of the queue to upload the file to.

    @argument name
    @type {string}
    @required
   */
  name: null,

  /**
    If set, disables input and prevents files from being added to the queue

    @argument disabled
    @type {boolean}
    @default false
   */
  disabled: false,


  /**
    A list of MIME types / extensions to be accepted by the input
    @argument accept
    @type {string}
   */
  accept: null,

  /**
    `onfileadd` is called when a file is selected.

    When multiple files are selected, this function
    is called once for every file that was selected.

    @argument onfileadd
    @type {function}
    @required
   */
  onfileadd: null,

  /**
    `ondragenter` is called when a file has entered
    the dropzone.

    @argument ondragenter
    @type {function}
   */
  ondragenter: null,

  /**
    `ondragleave` is called when a file has left
    the dropzone.

    @argument ondragleave
    @type {function}
   */
  ondragleave: null,

  /**
    `ondrop` is called when a file has been dropped.

    @argument ondrop
    @type {function}
   */
  ondrop: null,

  /**
    Whether users can upload content
    from websites by dragging images from
    another webpage and dropping it into
    your app. The default is `false` to
    prevent cross-site scripting issues.

    @argument allowUploadsFromWebsites
    @type {boolean}
    @default false
   */
  allowUploadsFromWebsites: false,

  /**
    This is the type of cursor that should
    be shown when a drag event happens.

    Corresponds to `dropEffect`.

    This is one of the following:

    - `copy`
    - `move`
    - `link`

    @argument cursor
    @type {string}
    @default null
   */
  cursor: null,

  didInsertElement() {
    this._super();

    dragListener.addEventListeners(`#${get(this, 'elementId')}`, {
      dragenter: bind(this, 'didEnterDropzone'),
      dragleave: bind(this, 'didLeaveDropzone'),
      dragover: bind(this, 'didDragOver'),
      drop: bind(this, 'didDrop')
    });
  },

  willDestroyElement() {
    dragListener.removeEventListeners(`#${get(this, 'elementId')}`);
  },

  isAllowed() {
    const { environment } = getOwner(this).resolveRegistration('config:environment');

    return environment === 'test' ||
           get(this[DATA_TRANSFER], 'source') === 'os' ||
           get(this, 'allowUploadsFromWebsites');
  },

  didEnterDropzone(evt) {
    let dataTransfer = DataTransfer.create({
      queue: get(this, 'queue'),
      source: evt.source,
      dataTransfer: evt.dataTransfer,
      itemDetails: evt.itemDetails
    });
    this[DATA_TRANSFER] = dataTransfer;

    if (this.isAllowed()) {
      evt.dataTransfer.dropEffect = get(this, 'cursor');
      set(this, 'active', true);
      set(this, 'valid', get(dataTransfer, 'valid'));

      if (this.ondragenter) {
        this.ondragenter(dataTransfer);
      }
    }
  },

  didLeaveDropzone(evt) {
    set(this[DATA_TRANSFER], 'dataTransfer', evt.dataTransfer);
    if (this.isAllowed()) {
      if (evt.dataTransfer) {
        evt.dataTransfer.dropEffect = get(this, 'cursor');
      }
      if (this.ondragleave) {
        this.ondragleave(this[DATA_TRANSFER]);
        this[DATA_TRANSFER] = null;
      }

      if (get(this, 'isDestroyed')) {
        return;
      }
      set(this, 'active', false);
    }
  },

  didDragOver(evt) {
    set(this[DATA_TRANSFER], 'dataTransfer', evt.dataTransfer);
    if (this.isAllowed()) {
      evt.dataTransfer.dropEffect = get(this, 'cursor');
    }
  },

  didDrop(evt) {
    set(this[DATA_TRANSFER], 'dataTransfer', evt.dataTransfer);

    if (!this.isAllowed()) {
      evt.dataTransfer.dropEffect = get(this, 'cursor');
      this[DATA_TRANSFER] = null;
      return;
    }

    // Testing support for dragging and dropping images
    // from other browser windows
    let url;

    let html = this[DATA_TRANSFER].getData('text/html');
    if (html) {
      let parsedHtml = parseHTML(html);
      let img = parsedHtml.getElementsByTagName('img')[0];
      if (img) {
        url = img.src;
      }
    }

    if (url == null) {
      url = this[DATA_TRANSFER].getData('text/uri-list');
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
          let binStr = atob(canvas.toDataURL().split(',')[1]);
          let len = binStr.length;
          let arr = new Uint8Array(len);

          for (var i=0; i<len; i++ ) {
            arr[i] = binStr.charCodeAt(i);
          }
          let blob = new Blob([arr], { type: 'image/png' });
          blob.name = filename;
          let [file] = get(this, 'queue')._addFiles([blob], 'web');
          set(file, 'name', filename);
        }
      };
      /* eslint-disable no-console */
      image.onerror = function (e) {
        console.log(e);
      };
      /* eslint-enable no-console */
      image.src = url;
    }

    if (this.ondrop) {
      this.ondrop(this[DATA_TRANSFER]);
    }

    // Add file(s) to upload queue.
    set(this, 'active', false);
    get(this, 'queue')._addFiles(get(this[DATA_TRANSFER], 'files'), 'drag-and-drop');
    this[DATA_TRANSFER] = null;
  }
});
