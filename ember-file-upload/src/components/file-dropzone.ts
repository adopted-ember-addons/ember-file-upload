import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { getOwner } from '@ember/application';
import DataTransferWrapper from '../system/data-transfer-wrapper';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { UploadFile } from '../upload-file';
import type FileQueueService from '../services/file-queue';
import { DEFAULT_QUEUE } from '../services/file-queue';
import {
  type FileUploadDragEvent,
  type FileDropzoneSignature,
  FileSource,
} from '../interfaces';
import DragListenerModifier from '../system/drag-listener-modifier';

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
export default class FileDropzoneComponent extends Component<FileDropzoneSignature> {
  @service declare fileQueue: FileQueueService;

  @tracked active = false;
  @tracked dataTransferWrapper?: DataTransferWrapper;

  supported = (() =>
    typeof window !== 'undefined' &&
    window.document &&
    'draggable' in document.createElement('span'))();

  get queue() {
    if (this.args.queue) {
      return this.args.queue;
    }

    return this.fileQueue.findOrCreate(DEFAULT_QUEUE);
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
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      getOwner(this).resolveRegistration('config:environment') as {
        environment: string;
      };

    return (
      environment === 'test' ||
      (this.dataTransferWrapper && this.dataTransferWrapper.source === 'os') ||
      this.args.allowUploadsFromWebsites
    );
  }

  get cursor() {
    return this.args.cursor ?? 'copy';
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
