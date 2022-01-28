import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { getOwner } from '@ember/application';
import FileUploadDataTransfer from '../system/data-transfer';
import parseHTML from '../system/parse-html';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import Queue from '../queue';
import UploadFile from 'ember-file-upload/upload-file';
import FileQueueService, { DEFAULT_QUEUE } from '../services/file-queue';

interface FileDropzoneArgs {
  queue?: Queue;

  /**
   * Whether users can upload content from websites by dragging images from
   * another webpage and dropping it into your app. The default is `false`
   * to prevent cross-site scripting issues.
   * */
  allowUploadsFromWebsites?: boolean;

  /**
   * This is the type of cursor that should
   * be shown when a drag event happens.
   *
   * Corresponds to `DataTransfer.dropEffect`.
   * (https://developer.mozilla.org/en-US/docs/Web/API/DataTransfer/dropEffect)
   */
  cursor?: 'link' | 'none' | 'copy' | 'move';

  // actions
  filter?: (file: UploadFile) => boolean;

  // events
  filesSelected?: (files: UploadFile[]) => void;

  /**
   * Called when files have entered the dropzone.
   */
  dragEnter?: (
    files: UploadFile[],
    dataTransfer: FileUploadDataTransfer
  ) => void;

  /**
   * Called when files have left the dropzone.
   */
  dragLeave?: (
    files: UploadFile[],
    dataTransfer: FileUploadDataTransfer
  ) => void;

  /**
   * Called when file have been dropped on the dropzone.
   */
  drop?: (files: UploadFile[], dataTransfer: FileUploadDataTransfer) => void;

  // old/deprecated API

  /**
   * @deprecated use `{{file-queue}}` helper with `{{queue.selectFile}}` modifier
   */
  accept?: string;

  /**
   * @deprecated use `{{file-queue}}` helper with `{{queue.selectFile}}` modifier
   */
  disabled?: boolean;

  /**
   * @deprecated use `{{file-queue}}` helper with `{{queue.selectFile}}` modifier
   */
  multiple?: boolean;

  /** @deprecated use `queue` instead */
  name?: string;

  /**
   * @deprecated use `{{file-queue}}` helper with `{{queue.selectFile}}` modifier
   */
  capture?: string;

  /**
   * @deprecated use `{{file-queue}}` helper with `{{queue.selectFile}}` modifier
   */
  for?: string;

  /**
   * @deprecated use `dragEnter()` instead
   */
  onDragEnter?: (
    files: UploadFile[],
    dataTransfer: FileUploadDataTransfer
  ) => void;

  /**
   * @deprecated use `dragLeave()` instead
   */
  onDragLeave?: (
    files: UploadFile[],
    dataTransfer: FileUploadDataTransfer
  ) => void;

  /**
   * @deprecated use `drop()` instead
   */
  onDrop?: (files: UploadFile[], dataTransfer: FileUploadDataTransfer) => void;

  /**
   * @deprecated use `fileAdded()` on queue instead
   */
  onFileAdd: (file: UploadFile, dataTransfer: FileUploadDataTransfer) => void;
}

// TODO type DragListener and migrate these
export interface ItemDetail {
  kind: string;
  type: string;
}

export interface FileUploadDragEvent {
  source: 'os' | 'web';
  dataTransfer: DataTransfer;
  itemDetails: ItemDetail[];
}

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
export default class FileDropzoneComponent extends Component<FileDropzoneArgs> {
  @service declare fileQueue: FileQueueService;

  @tracked active = false;
  @tracked dataTransfer?: FileUploadDataTransfer;

  supported = (() =>
    typeof window !== 'undefined' &&
    window.document &&
    'draggable' in document.createElement('span'))();

  get queue() {
    if (this.args.queue) {
      return this.args.queue;
    }

    return this.fileQueue.findOrCreate(this.args.name ?? DEFAULT_QUEUE);
  }

  get files() {
    return this.dataTransfer?.files ?? [];
  }

  get isAllowed() {
    const { environment } =
      getOwner(this).resolveRegistration('config:environment');

    return (
      environment === 'test' ||
      (this.dataTransfer && this.dataTransfer.source === 'os') ||
      this.args.allowUploadsFromWebsites
    );
  }

  get cursor() {
    return this.args.cursor ?? 'move';
  }

  @action
  didEnterDropzone(event: FileUploadDragEvent) {
    this.dataTransfer = new FileUploadDataTransfer(
      this.queue,
      event.source,
      event.dataTransfer,
      event.itemDetails
    );

    if (this.isAllowed) {
      event.dataTransfer.dropEffect = this.cursor;
      this.active = true;

      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      this.args.onDragEnter?.(this.files, this.dataTransfer);
    }
  }

  @action
  didLeaveDropzone(event: FileUploadDragEvent) {
    if (this.dataTransfer) {
      this.dataTransfer.dataTransfer = event.dataTransfer;
    }
    if (this.isAllowed) {
      if (event.dataTransfer) {
        event.dataTransfer.dropEffect = this.cursor;
      }
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      this.args.onDragLeave?.(this.files, this.dataTransfer);
      this.dataTransfer = undefined;

      if (this.isDestroyed) {
        return;
      }
      this.active = false;
    }
  }

  @action
  didDragOver(event: FileUploadDragEvent) {
    if (this.dataTransfer) {
      this.dataTransfer.dataTransfer = event.dataTransfer;
    }
    if (this.isAllowed) {
      event.dataTransfer.dropEffect = this.cursor;
    }
  }

  @action
  didDrop(event: FileUploadDragEvent) {
    if (this.dataTransfer) {
      this.dataTransfer.dataTransfer = event.dataTransfer;
    }

    if (!this.isAllowed) {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      event.dataTransfer.dropEffect = this.cursor;
      this.dataTransfer = undefined;
      return;
    }

    // Testing support for dragging and dropping images
    // from other browser windows
    let url;

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const html = this.dataTransfer.getData('text/html');
    if (html) {
      const parsedHtml = parseHTML(html);
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      const img = parsedHtml.getElementsByTagName('img')[0];
      if (img) {
        url = img.src;
      }
    }

    if (url == null) {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      url = this.dataTransfer.getData('text/uri-list');
    }

    if (url) {
      const image = new Image();
      const [filename] = url.split('/').slice(-1);
      image.crossOrigin = 'anonymous';
      image.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = image.width;
        canvas.height = image.height;

        const ctx = canvas.getContext('2d');
        ctx?.drawImage(image, 0, 0);

        if (canvas.toBlob) {
          canvas.toBlob((blob) => {
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            const [file] = this.queue._addFiles([blob], 'web');
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            file.name = filename;
          });
        } else {
          const binStr = atob(canvas.toDataURL().split(',')[1]);
          const len = binStr.length;
          const arr = new Uint8Array(len);

          for (let i = 0; i < len; i++) {
            arr[i] = binStr.charCodeAt(i);
          }
          const blob = new Blob([arr], { type: 'image/png' });
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          blob.name = filename;
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          const [file] = this.queue._addFiles([blob], 'web');
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
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

    const files =
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      this.args.onDrop?.(this.files, this.dataTransfer) ?? this.files;

    // Add files to upload queue.
    this.active = false;
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    this.queue._addFiles(files, 'drag-and-drop');
    this.dataTransfer = undefined;
  }
}
