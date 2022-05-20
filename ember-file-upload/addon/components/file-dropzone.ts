import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { getOwner } from '@ember/application';
import DataTransferWrapper from '../system/data-transfer-wrapper';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import Queue from '../queue';
import UploadFile from 'ember-file-upload/upload-file';
import FileQueueService, { DEFAULT_QUEUE } from '../services/file-queue';
import { modifier } from 'ember-modifier';
import { deprecate } from '@ember/debug';
import { isPresent } from '@ember/utils';
import { FileUploadDragEvent, FileSource } from 'ember-file-upload/interfaces';
import DragListenerModifier from '../system/drag-listener-modifier';

interface FileDropzoneArgs {
  queue?: Queue;

  /**
   * Whether users can upload content from websites by dragging images from
   * another webpage and dropping it into your app. The default is `false`
   * to prevent cross-site scripting issues.
   *
   * @defaulValue false
   * */
  allowUploadsFromWebsites?: boolean;

  /**
   * This is the type of cursor that should
   * be shown when a drag event happens.
   *
   * Corresponds to `DataTransfer.dropEffect`.
   * (https://developer.mozilla.org/en-US/docs/Web/API/DataTransfer/dropEffect)
   *
   * @defaultValue 'copy'
   */
  cursor?: 'link' | 'none' | 'copy' | 'move';

  /**
   * Whether to add multiple files to the queue at once.
   *
   * If set to false only one file will be added when dropping mulitple files.
   *
   * @defaultValue true
   */
  multiple?: boolean;

  // actions
  filter?: (file: File, files: File[], index: number) => boolean;

  /**
   * Called when files have entered the dropzone.
   */
  onDragEnter?: (files: File[], dataTransfer: DataTransferWrapper) => void;

  /**
   * Called when files have left the dropzone.
   */
  onDragLeave?: (files: File[], dataTransfer: DataTransferWrapper) => void;

  /**
   * Called when file have been dropped on the dropzone.
   */
  onDrop?: (files: UploadFile[], dataTransfer: DataTransferWrapper) => void;

  // old/deprecated API

  /**
   * @deprecated Use `@filter` instead.
   */
  accept?: string;

  /**
   * @deprecated If necessary, disable uploads in your own implementation.
   */
  disabled?: boolean;

  /**
   * @deprecated Use `@queue` instead.
   * */
  name?: string;

  /**
   * @deprecated Can be removed as it is non-functional.
   */
  capture?: string;

  /**
   * @deprecated Can be removed as it is non-functional.
   */
  for?: string;

  /**
   * @deprecated Use `onFileAdded` with {{file-queue}} helper or `@onDrop`.
   */
  onFileAdd: (file: UploadFile) => void;
}

/**
  `FileDropzone` is a component that will allow users to upload files by
   drag and drop.

  ```hbs
  <FileDropzone @queue={{queue}} as |dropzone|>
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
      </p>
    {{/if}}
  </FileDropzone>
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
  @tracked dataTransferWrapper?: DataTransferWrapper;

  supported = (() =>
    typeof window !== 'undefined' &&
    window.document &&
    'draggable' in document.createElement('span'))();

  constructor(owner: unknown, args: FileDropzoneArgs) {
    super(owner, args);

    deprecate(
      `\`@accept\` is deprecated. Use \`@filter\` instead.`,
      !isPresent(args.accept),
      {
        for: 'ember-file-upload',
        id: 'file-dropzone.accept',
        since: { enabled: 'v5.0.0' },
        until: 'v6.0.0',
        url: 'https://ember-file-upload.pages.dev/docs/upgrade-guide#filedropzone-component',
      }
    );

    deprecate(
      `\`@disabled\` is deprecated. If necessary, disable uploads in your own implementation.`,
      !isPresent(args.disabled),
      {
        for: 'ember-file-upload',
        id: 'file-dropzone.disabled',
        since: { enabled: 'v5.0.0' },
        until: 'v6.0.0',
        url: 'https://ember-file-upload.pages.dev/docs/upgrade-guide#filedropzone-component',
      }
    );

    deprecate(
      `\`@name\` is deprecated. Use \`@queue\` instead.`,
      !isPresent(args.name),
      {
        for: 'ember-file-upload',
        id: 'file-dropzone.name',
        since: { enabled: 'v5.0.0' },
        until: 'v6.0.0',
        url: 'https://ember-file-upload.pages.dev/docs/upgrade-guide#filedropzone-component',
      }
    );

    deprecate(
      `\`@capture\` is deprecated. It can be removed as it is non-functional.`,
      !isPresent(args.capture),
      {
        for: 'ember-file-upload',
        id: 'file-dropzone.capture',
        since: { enabled: 'v5.0.0' },
        until: 'v6.0.0',
        url: 'https://ember-file-upload.pages.dev/docs/upgrade-guide#filedropzone-component',
      }
    );

    deprecate(
      `\`@for\` is deprecated. It can be removed as it is non-functional.`,
      !isPresent(args.for),
      {
        for: 'ember-file-upload',
        id: 'file-dropzone.for',
        since: { enabled: 'v5.0.0' },
        until: 'v6.0.0',
        url: 'https://ember-file-upload.pages.dev/docs/upgrade-guide#filedropzone-component',
      }
    );

    deprecate(
      `\`@onFileAdd\` is deprecated. Use \`onFileAdded\` with {{file-queue}} helper or \`@onDrop\`.`,
      !isPresent(args.onFileAdd),
      {
        for: 'ember-file-upload',
        id: 'file-dropzone.on-file-add',
        since: { enabled: 'v5.0.0' },
        until: 'v6.0.0',
        url: 'https://ember-file-upload.pages.dev/docs/upgrade-guide#filedropzone-component',
      }
    );
  }

  get queue() {
    if (this.args.queue) {
      return this.args.queue;
    }

    return this.fileQueue.findOrCreate(this.args.name ?? DEFAULT_QUEUE);
  }

  get multiple() {
    return this.args.multiple ?? true;
  }

  get files(): File[] {
    const files = this.dataTransferWrapper?.files ?? [];
    if (this.multiple) return files;

    return files.slice(0, 1);
  }

  get isAllowed() {
    const { environment } =
      getOwner(this).resolveRegistration('config:environment');

    return (
      environment === 'test' ||
      (this.dataTransferWrapper && this.dataTransferWrapper.source === 'os') ||
      this.args.allowUploadsFromWebsites
    );
  }

  get cursor() {
    return this.args.cursor ?? 'copy';
  }

  bindListeners = modifier(
    () => {
      this.queue.addListener(this);
      return () => this.queue.removeListener(this);
    },
    { eager: false }
  );

  onFileAdded(file: UploadFile) {
    this.args.onFileAdd?.(file);
  }

  @action
  didEnterDropzone(event: FileUploadDragEvent) {
    this.dataTransferWrapper = new DataTransferWrapper(event);

    if (this.isAllowed) {
      event.dataTransfer.dropEffect = this.cursor;
      this.active = true;

      this.args.onDragEnter?.(this.files, this.dataTransferWrapper);
    }
  }

  @action
  didLeaveDropzone(event: FileUploadDragEvent) {
    if (this.dataTransferWrapper) {
      this.dataTransferWrapper.dataTransfer = event.dataTransfer;
    }
    if (this.dataTransferWrapper && this.isAllowed) {
      if (event.dataTransfer) {
        event.dataTransfer.dropEffect = this.cursor;
      }
      this.args.onDragLeave?.(this.files, this.dataTransferWrapper);

      this.dataTransferWrapper = undefined;

      if (this.isDestroyed) {
        return;
      }
      this.active = false;
    }
  }

  @action
  didDragOver(event: FileUploadDragEvent) {
    if (this.dataTransferWrapper) {
      this.dataTransferWrapper.dataTransfer = event.dataTransfer;
    }
    if (this.isAllowed) {
      event.dataTransfer.dropEffect = this.cursor;
    }
  }

  @action
  didDrop(event: FileUploadDragEvent) {
    if (this.dataTransferWrapper) {
      this.dataTransferWrapper.dataTransfer = event.dataTransfer;
    }

    if (!this.isAllowed) {
      event.dataTransfer.dropEffect = this.cursor;
      this.dataTransferWrapper = undefined;
      return;
    }

    // @TODO - add tests for these or remove them
    // // Testing support for dragging and dropping images
    // // from other browser windows
    // let url;

    // // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // // @ts-ignore
    // const html = this.dataTransferWrapper.getData('text/html');
    // if (html) {
    //   const parsedHtml = parseHTML(html);
    //   // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    //   // @ts-ignore
    //   const img = parsedHtml.getElementsByTagName('img')[0];
    //   if (img) {
    //     url = img.src;
    //   }
    // }

    // if (url == null) {
    //   // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    //   // @ts-ignore
    //   url = this.dataTransferWrapper.getData('text/uri-list');
    // }

    // if (url) {
    //   const image = new Image();
    //   const [filename] = url.split('/').slice(-1);
    //   image.crossOrigin = 'anonymous';
    //   image.onload = () => {
    //     const canvas = document.createElement('canvas');
    //     canvas.width = image.width;
    //     canvas.height = image.height;

    //     const ctx = canvas.getContext('2d');
    //     ctx?.drawImage(image, 0, 0);

    //     if (canvas.toBlob) {
    //       canvas.toBlob((blob) => {
    //         // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    //         // @ts-ignore
    //         const [file] = this.addFiles([blob], FileSource.web);
    //         // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    //         // @ts-ignore
    //         file.name = filename;
    //       });
    //     } else {
    //       const binStr = atob(canvas.toDataURL().split(',')[1]);
    //       const len = binStr.length;
    //       const arr = new Uint8Array(len);

    //       for (let i = 0; i < len; i++) {
    //         arr[i] = binStr.charCodeAt(i);
    //       }
    //       const blob = new Blob([arr], { type: 'image/png' });
    //       // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    //       // @ts-ignore
    //       blob.name = filename;
    //       // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    //       // @ts-ignore
    //       const [file] = this.addFiles([blob], FileSource.web);
    //       // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    //       // @ts-ignore
    //       file.name = filename;
    //     }
    //   };
    //   /* eslint-disable no-console */
    //   image.onerror = function (e) {
    //     console.log(e);
    //   };
    //   /* eslint-enable no-console */
    //   image.src = url;
    // }

    if (this.dataTransferWrapper) {
      const addedFiles = this.addFiles(this.files);
      this.args.onDrop?.(addedFiles, this.dataTransferWrapper);

      this.active = false;
      this.dataTransferWrapper = undefined;
    }
  }

  addFiles(files: File[]) {
    const addedFiles = [];
    for (const file of files) {
      if (file instanceof File) {
        const uploadFile = new UploadFile(file, FileSource.DragAndDrop);
        if (
          this.args.filter &&
          !this.args.filter(file, files, files.indexOf(file))
        ) {
          continue;
        }
        this.queue.add(uploadFile);
        addedFiles.push(uploadFile);
      }
    }
    return addedFiles;
  }

  dragListener = DragListenerModifier;
}
