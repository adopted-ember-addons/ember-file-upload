import { tracked } from '@glimmer/tracking';

import { upload } from './system/upload';
import HTTPRequest from './system/http-request';
import UploadFileReader from './system/upload-file-reader';

import type { Queue } from './queue';
import { guidFor } from '@ember/object/internals';
import RSVP from 'rsvp';
import { FileSource, FileState, UploadOptions } from './interfaces';

/**
 * Files provide a uniform interface for interacting
 * with data that can be uploaded or read.
 */
export class UploadFile {
  file: File;
  #source: FileSource;

  queue?: Queue;

  constructor(file: File, source: FileSource) {
    this.file = file;
    this.#source = source;
  }

  /**
   * The source of the file. This is useful
   * for applications that want to gather
   * analytics about how users upload their
   * content.
   */
  get source(): FileSource {
    return this.#source;
  }

  #id = `file-${guidFor(this)}`;

  /** A unique id generated for this file. */
  get id(): string {
    return this.#id;
  }

  #name?: string;

  /** The file name */
  get name(): string {
    return this.#name ?? this.file?.name;
  }
  set name(value: string) {
    this.#name = value;
  }

  #size = 0;

  /** The size of the file in bytes. */
  get size() {
    return this.#size || this.file.size;
  }

  set size(value) {
    this.#size = value;
  }

  /**
   * The MIME type of the file.
   *
   * For a image file this may be `image/png`.
   */
  get type(): string {
    return this.file.type;
  }

  /**
   * Returns the appropriate file extension of
   * the file according to the type
   */
  get extension(): string {
    return this.type.split('/').slice(-1)[0] ?? '';
  }

  /** The number of bytes that have been uploaded to the server */
  @tracked loaded = 0;

  /**
   * The current progress of the upload, as a percentage in the
   * range of 0 to 100.
   */
  @tracked progress = 0;

  /**
   * The current state that the file is in.
   */
  @tracked state: FileState = FileState.Queued;

  // /**
  //   The source of the file. This is useful
  //   for applications that want to gather
  //   analytics about how users upload their
  //   content.

  //   This property can be one of the following:

  //   - `browse`
  //   - `drag-and-drop`
  //   - `web`
  //   - `data-url`
  //   - `blob`

  //   `browse` is the source when the file is created
  //   using the native file picker.

  //   `drag-and-drop` is the source when the file was
  //   created using drag and drop from their desktop.

  //   `web` is the source when the file was created
  //   by dragging the file from another webpage.

  //   `data-url` is the source when the file is created
  //   from a data URL using the `fromDataURL` method for
  //   files. This usually means that the file was created
  //   manually by the developer on behalf of the user.

  //   `blob` is the source when the file is created
  //   from a blob using the `fromBlob` method for
  //   files. This usually means that the file was created
  //   manually by the developer.

  //   @accessor source
  //   @type {String}
  //   @default ''
  //   @readonly
  //  */
  // source?: FileSource;

  /**
   * Upload file with `application/octet-stream` content type.
   *
   * @param url Your server endpoint where to upload the file
   * @param options additional request options
   */
  uploadBinary(url: string, options: UploadOptions) {
    options.contentType = 'application/octet-stream';
    return upload(this, url, options, (request) => {
      this.queue?.uploadStarted(this);
      return request.send(this.file);
    });
  }

  /**
   * Upload file to your server
   *
   * @param url Your server endpoint where to upload the file
   * @param options additional options, eg. `{ fileKey: string, data: { key: string } }`
   */
  upload(url: string, options?: UploadOptions) {
    return upload(
      this,
      url,
      options,
      (request: HTTPRequest, opts: UploadOptions): RSVP.Promise<Response> => {
        // Build the form
        const form = new FormData();
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        for (const key of Object.keys(opts.data)) {
          if (key === opts.fileKey) {
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            form.append(key, opts.data[key], this.name);
          } else {
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            form.append(key, opts.data[key]);
          }
        }

        this.queue?.uploadStarted(this);
        return request.send(form);
      }
    );
  }

  /**
   * Resolves with Blob as ArrayBuffer
   */
  readAsArrayBuffer() {
    const reader = new UploadFileReader({
      label: `Read ${this.name} as an ArrayBuffer`,
    });
    return reader.readAsArrayBuffer(this.file);
  }

  /**
   * Resolves with Blob as DataURL
   */
  readAsDataURL() {
    const reader = new UploadFileReader({
      label: `Read ${this.name} as a Data URI`,
    });
    return reader.readAsDataURL(this.file);
  }

  /**
   * Resolves with Blob as binary string
   */
  readAsBinaryString() {
    const reader = new UploadFileReader({
      label: `Read ${this.name} as a binary string`,
    });
    return reader.readAsBinaryString(this.file);
  }

  /**
   * Resolves with Blob as plain text
   */
  readAsText() {
    const reader = new UploadFileReader({ label: `Read ${this.name} as text` });
    return reader.readAsText(this.file);
  }

  /**
   * Creates a file object that can be read or uploaded to a
   * server from a Blob object.
   *
   * @param blob the blob to create the file from.
   * @param source the source that created the blob.
   * @returns the file
   */
  static fromBlob(blob: Blob, source = FileSource.Blob) {
    const file = new File([blob], 'blob', { type: blob.type });
    return new this(file, source);
  }

  /**
   * Creates a file object that can be read or uploaded to a
   * server from a data URL.
   *
   * @param dataURL the data URL to create the file from.
   * @param source the source of the data URL.
   * @returns the file
   */
  static fromDataURL(dataURL: string, source = FileSource.DataUrl) {
    const [typeInfo, base64String] = dataURL.split(',');
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const mimeType = typeInfo.match(/:(.*?);/)[1];

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const binaryString = atob(base64String);
    const binaryData = new Uint8Array(binaryString.length);

    for (let i = 0, len = binaryString.length; i < len; i++) {
      binaryData[i] = binaryString.charCodeAt(i);
    }

    const blob = new Blob([binaryData], { type: mimeType });

    return this.fromBlob(blob, source);
  }
}
