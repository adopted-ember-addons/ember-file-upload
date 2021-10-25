import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { getOwner } from '@ember/application';
import DataTransfer from '../system/data-transfer';
import parseHTML from '../system/parse-html';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import deprecateNonCamelCaseEvents from '../utils/deprecate-non-camel-case-events';

let supported = (function () {
  return (
    typeof window !== 'undefined' &&
    window.document &&
    'draggable' in document.createElement('span')
  );
})();

/**
  Whether multiple files can be selected when uploading.
  @argument multiple
  @type {boolean}
  */

/**
  The name of the queue to upload the file to.

  @argument name
  @type {string}
  @required
  */

/**
  If set, disables input and prevents files from being added to the queue

  @argument disabled
  @type {boolean}
  @default false
  */

/**
  `onFileAdd` is called when a file is added to the upload queue.

  When multiple files are added, this function
  is called once for every file.

  @argument onFileAdd
  @type {function(file: File)}
  @required
  */

/**
  `onDragEnter` is called when files have entered
  the dropzone.

  @argument onDragEnter
  @type {function(files: File[], dataTransfer: DataTransfer)}
  */

/**
  `onDragLeave` is called when files have left
  the dropzone.

  @argument onDragLeave
  @type {function(files: File[], dataTransfer: DataTransfer)}
  */

/**
  `onDrop` is called when file have been dropped on the dropzone.

  Optionally restrict which files are added to the upload queue by
  returning an array of File objects.

  @argument onDrop
  @type {function(files: File[], dataTransfer: DataTransfer)}
  */

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

/**
  `FileDropzone` is a component that will allow users to upload files by
   drag and drop.

  ```hbs
  <FileDropzone @name="photos" as |dropzone queue|>
    {{#if dropzone.active}}
      Drop to upload
    {{else if queue.files.length}}
      Uploading {{queue.files.length}} files. ({{queue.progress}}%)
    {{else}}
      <h4>Upload Images</h4>
      <p>
        {{#if dropzone.supported}}
          Drag and drop images onto this area to upload them or
        {{/if}}
        <FileUpload
          @name="photos"
          @accept="image/*"
          @multiple=true
          @onFileAdd={{perform this.uploadImage}}
        >
          <a tabindex="0">Add an Image.</a>
        </FileUpload>
      </p>
    {{/if}}
  </FileDropzone>
  ```

  ```js
  import Component from '@glimmer/component';
  import { task } from 'ember-concurrency';

  export default class ExampleComponent extends Component {
    @task({ maxConcurrency: 3, enqueue: true })
    *uploadImage(file) {
      const response = yield file.upload(url, options);
      ...
    }
  }
  ```

  @class FileDropzoneComponent
  @type Ember.Component
  @yield {Hash} dropzone
  @yield {boolean} dropzone.supported
  @yield {boolean} dropzone.active
  @yield {Queue} queue
 */
export default class FileDropzoneComponent extends Component {
  @service fileQueue;

  @tracked supported = supported;
  @tracked active = false;
  @tracked dataTransfer;

  get onFileAdd() {
    if (this.args.onfileadd) {
      deprecateNonCamelCaseEvents('onfileadd', 'onFileAdd');
      return this.args.onfileadd;
    }
    return this.args.onFileAdd;
  }

  get onDragEnter() {
    if (this.args.ondragenter) {
      deprecateNonCamelCaseEvents('ondragenter', 'onDragEnter');
      return this.args.ondragenter;
    }
    return this.args.onDragEnter;
  }

  get onDragLeave() {
    if (this.args.ondragleave) {
      deprecateNonCamelCaseEvents('ondragleave', 'onDragLeave');
      return this.args.ondragleave;
    }
    return this.args.onDragLeave;
  }

  get onDrop() {
    if (this.args.ondrop) {
      deprecateNonCamelCaseEvents('ondrop', 'onDrop');
      return this.args.ondrop;
    }
    return this.args.onDrop;
  }

  get queue() {
    if (!this.args.name) return null;

    return (
      this.fileQueue.find(this.args.name) ||
      this.fileQueue.create(this.args.name)
    );
  }

  get files() {
    return this.dataTransfer?.files;
  }

  isAllowed() {
    const { environment } =
      getOwner(this).resolveRegistration('config:environment');

    return (
      environment === 'test' ||
      this.dataTransfer.source === 'os' ||
      this.args.allowUploadsFromWebsites
    );
  }

  @action
  didEnterDropzone(evt) {
    this.dataTransfer = new DataTransfer({
      queue: this.queue,
      source: evt.source,
      dataTransfer: evt.dataTransfer,
      itemDetails: evt.itemDetails,
    });

    if (this.isAllowed()) {
      evt.dataTransfer.dropEffect = this.args.cursor;
      this.active = true;

      if (this.onDragEnter) {
        this.onDragEnter(this.files, this.dataTransfer);
      }
    }
  }

  @action
  didLeaveDropzone(evt) {
    this.dataTransfer.dataTransfer = evt.dataTransfer;
    if (this.isAllowed()) {
      if (evt.dataTransfer) {
        evt.dataTransfer.dropEffect = this.args.cursor;
      }
      if (this.onDragLeave) {
        this.onDragLeave(this.files, this.dataTransfer);
        this.dataTransfer = null;
      }

      if (this.isDestroyed) {
        return;
      }
      this.active = false;
    }
  }

  @action
  didDragOver(evt) {
    this.dataTransfer.dataTransfer = evt.dataTransfer;
    if (this.isAllowed()) {
      evt.dataTransfer.dropEffect = this.args.cursor;
    }
  }

  @action
  didDrop(evt) {
    this.dataTransfer.dataTransfer = evt.dataTransfer;

    if (!this.isAllowed()) {
      evt.dataTransfer.dropEffect = this.args.cursor;
      this.dataTransfer = null;
      return;
    }

    // Testing support for dragging and dropping images
    // from other browser windows
    let url;

    let html = this.dataTransfer.getData('text/html');
    if (html) {
      let parsedHtml = parseHTML(html);
      let img = parsedHtml.getElementsByTagName('img')[0];
      if (img) {
        url = img.src;
      }
    }

    if (url == null) {
      url = this.dataTransfer.getData('text/uri-list');
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
            let [file] = this.queue._addFiles([blob], 'web');
            file.name = filename;
          });
        } else {
          let binStr = atob(canvas.toDataURL().split(',')[1]);
          let len = binStr.length;
          let arr = new Uint8Array(len);

          for (var i = 0; i < len; i++) {
            arr[i] = binStr.charCodeAt(i);
          }
          let blob = new Blob([arr], { type: 'image/png' });
          blob.name = filename;
          let [file] = this.queue._addFiles([blob], 'web');
          file.name = filename;
        }
      };
      /* eslint-disable no-console */
      image.onerror = function (e) {
        console.log(e);
      };
      /* eslint-enable no-console */
      image.src = url;
    }

    const files = this.onDrop?.(this.files, this.dataTransfer) ?? this.files;

    // Add files to upload queue.
    this.active = false;
    this.queue._addFiles(files, 'drag-and-drop');
    this.dataTransfer = null;
  }
}
