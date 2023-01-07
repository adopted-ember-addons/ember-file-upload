import type { UploadFile } from './upload-file';
import type { Queue } from './queue';
import type FileQueueService from './services/file-queue';
import type DataTransferWrapper from './system/data-transfer-wrapper';

export interface FileQueueArgs {
  name?: string;
  onFileAdded?: (file: UploadFile) => void;
  onFileRemoved?: (file: UploadFile) => void;
}

declare module '@ember/service' {
  interface Registry {
    'file-queue': FileQueueService;
  }
}

export interface QueueListener {
  onFileAdded?(file: UploadFile): void;
  onFileRemoved?(file: UploadFile): void;
}

export type QueueName = string | symbol;

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

export interface FileDropzoneArgs {
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
}

export interface FileUploadDragEvent extends DragEvent {
  source: 'os' | 'web';
  dataTransfer: DataTransfer;
  itemDetails: DataTransferItem[];
}

export interface UploadOptions {
  url?: string;
  method?: string;
  accepts?: string[];
  headers?: Record<string, string>;
  fileKey?: string;
  contentType?: string;
  data?: Record<string, string | File>;
  withCredentials?: boolean;
  timeout?: number;
}

export interface HTTPRequestOptions {
  label?: string;
  withCredentials?: boolean;
  timeout?: number;
}

export interface HTTPRequestResponse {
  status: number;
  body: string | Document | HTMLElement[] | null | undefined;
  headers: Record<string, string>;
}

export interface DragListenerModifierSignature {
  Args: {
    Named: DragListenerHandlers;
  };
}

type DragListenerHandler = (event: DragEvent | SyntheticDragEvent) => void;

export interface DragListenerHandlers {
  dragenter?: DragListenerHandler;
  dragleave?: DragListenerHandler;
  dragover?: DragListenerHandler;
  drop?: DragListenerHandler;
}

export interface DragEventListener {
  element: Element;
  handlers: DragListenerHandlers;
}

export interface QueuedDragEvent {
  eventName: 'dragenter' | 'dragleave' | 'dragover' | 'drop';
  listener: DragEventListener;
  event: DragEvent | SyntheticDragEvent;
}

export interface SyntheticDragEvent {
  source: FileUploadDragEvent['source'];
  dataTransfer: DataTransfer | null;
  itemDetails: Array<{
    kind: string;
    type: string;
  }>;
}
