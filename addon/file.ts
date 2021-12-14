import { tracked } from '@glimmer/tracking';

import FileReader from './system/file-reader';
import { upload } from './system/upload';
import uuid from './system/uuid';

import Queue from './queue';

/**
 * Possible file states.
 *
 * @remarks
 *
 * Here is the statechart describing the flow of state:
 *
 * ```
 *       .------.     .---------.     .--------.
 *   o--| queued |-->| uploading |-->| uploaded |
 *       `------`     `---------`     `--------`
 *          ^              |    .-------.
 *          |              |`->| aborted |
 *          |              |    `-------`
 *          |  .------.    |    .---------.
 *          `-| failed |<-` `->| timed_out |-.
 *          |  `------`         `---------`  |
 *          `-------------------------------`
 * ```
 */
export enum FileState {
  Queued = 'queued',
  Uploading = 'uploading',
  TimedOut = 'timed_out',
  Aborted = 'aborted',
  Uploaded = 'uploaded',
  Failed = 'failed',
}

export enum FileSource {
  /**
   * the file is created using the native file picker
   */
  Browse = 'browse',

  /**
   * the file was created using drag and drop from their desktop
   */
  DragAndDrop = 'drag-and-drop',

  /**
   * the file was created by dragging the file from another webpage
   */
  Web = 'web',

  /**
   * the file is created from a data URL using the `fromDataURL`
   * method for files. This usually means that the file was created
   * manually by the developer on behalf of the user
   */
  DataUrl = 'data-url',

  /**
   * the file is created from a blob using the `fromBlob`
   * method for files. This usually means that the file was created
   * manually by the developer
   */
  Blob = 'blob',
}

/**
 * Files provide a uniform interface for interacting
 * with data that can be uploaded or read.
 */
export default class File {
  // @TODO: Extract this "special" blob thingy into its own type
  #blob: Blob & {
    name?: string;
  };
  #source: FileSource;

  queue?: Queue;

  private constructor(blob: Blob, source: FileSource) {
    this.#blob = blob;
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

  #id = `file-${uuid()}`;

  /** A unique id generated for this file. */
  get id(): string {
    return this.#id;
  }

  /** The file name */
  get name(): string {
    // @TODO: this "default" name here looks wrong - the tests wanted it ?!?
    return this.#blob?.name ?? 'blob';
  }

  /** The size of the file in bytes. */
  #size = 0;

  get size() {
    return this.#size ?? this.#blob.size;
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
    return this.#blob.type;
  }

  /**
   * Returns the appropriate file extension of
   * the file according to the type
   */
  get extension(): string {
    return this.type.split('/').slice(-1)[0];
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
  @tracked private internalState: FileState = FileState.Queued;

  get state() {
    return this.internalState;
  }

  set state(value) {
    this.internalState = value;
    this.queue?.flush();
  }

  // @TODO: For both `upload*()` methods, the return value `Promise<unknown>` is
  // very much unspecified and needs more details

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
  uploadBinary(
    url: string,
    options: Record<string, unknown>
  ): Promise<unknown> {
    options.contentType = 'application/octet-stream';
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore this is not typed
    return upload(this, url, options, (request) => {
      return request.send(this.#blob);
    });
  }

  /**
   * Upload file to your server
   *
   * @param url Your server endpoint where to upload the file
   * @param options additional options, eg. `{ fileKey: string, data: { key: string } }`
   */
  upload(url: string, options: Record<string, unknown>): Promise<unknown> {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore this is not typed
    return upload(this, url, options, (request, opts) => {
      // Build the form
      const form = new FormData();

      for (const key of Object.keys(opts.data)) {
        if (key === opts.fileKey) {
          // @TODO: Am I doing this right here?
          form.append(key, this.#blob, this.name);
        } else {
          form.append(key, opts.data[key]);
        }
      }

      return request.send(form);
    });
  }

  /**
   * Resolves with Blob as ArrayBuffer
   */
  readAsArrayBuffer() {
    const reader = new FileReader({
      label: `Read ${this.name} as an ArrayBuffer`,
    });
    return reader.readAsArrayBuffer(this.#blob);
  }

  /**
   * Resolves with Blob as DataURL
   */
  readAsDataURL() {
    const reader = new FileReader({
      label: `Read ${this.name} as a Data URI`,
    });
    return reader.readAsDataURL(this.#blob);
  }

  /**
   * Resolves with Blob as binary string
   */
  readAsBinaryString() {
    const reader = new FileReader({
      label: `Read ${this.name} as a binary string`,
    });
    return reader.readAsBinaryString(this.#blob);
  }

  /**
   * Resolves with Blob as plain text
   */
  readAsText() {
    const reader = new FileReader({ label: `Read ${this.name} as text` });
    return reader.readAsText(this.#blob);
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
    return new this(blob, source);
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

    const binaryString = atob(base64String);
    const binaryData = new Uint8Array(binaryString.length);

    for (let i = 0, len = binaryString.length; i < len; i++) {
      binaryData[i] = binaryString.charCodeAt(i);
    }

    const blob = new Blob([binaryData], { type: mimeType });

    return this.fromBlob(blob, source);
  }
}
