export default class File {
  /**
   * Returns the appropriate file extension of the file according to the type
   */
  extension: string;

  /**
   * A unique id generated for this file
   */
  id: string;

  loaded: number;

  /**
   * The file name
   */
  name: string;

  progress: number;

  /**
   * The size of the file in bytes
   */
  size: number;

  /**
   * The source of the file. This is useful for applications that want to gather analytics about how users upload their content.
   * - browse is the source when the file is created using the native file picker
   * - drag-and-drop is the source when the file was created using drag and drop from their desktop
   * - web is the source when the file was created by dragging the file from another webpage.
   * - data-url is the source when the file is created from a data URL using the fromDataURL method for files. This usually means that the file was created manually by the developer on behalf of the user
   * - blob is the source when the file is created from a blob using the fromBlob method for files. This usually means that the file was created manually by the developer.
   */
  source: 'browse' | 'drag-and-drop' | 'web' | 'data-url' | 'blob';

  /**
   * The current state that the file is in. Implementers should call flush() on the file's queue after mutating this property
   */
  state: 'queued' | 'uploading' | 'timed_out' | 'aborted' | 'uploaded' | 'failed';

  /**
   * The MIME type of the file.
   * For a image file this may be image/png
   */
  type: string;

  /**
   * Upload file to your server
   * @param url Your server endpoint where to upload the file
   * @param opts { fileKey: string, data: { key: string } }
   */
  upload(url: string, opts: {}): Promise<any>;

  /**
   * Upload file with application/octet-stream content type
   * @param url Your server endpoint where to upload the file
   * @param opts
   */
  uploadBinary(url: string, opts: {}): Promise<any>;

  /**
   * Resolves with Blob as ArrayBuffer
   */
  readAsArrayBuffer(): Promise<any>;

  /**
   * Resolves with Blob as binary string
   */
  readAsBinaryString(): Promise<string>;

  /**
   * Resolves with Blob as DataURL
   */
  readAsDataURL(): Promise<string>;

  /**
   * Resolves with Blob as plain text
   */
  readAsText(): Promise<any>;

  /**
   * Creates a file object that can be read or uploaded to a server from a Blob object
   * @param blob The blob to create the file from
   * @param source The source that created the blob.
   */
  static fromBlob(blob: Blob, source: string): Promise<any>;

  /**
   * Creates a file object that can be read or uploaded to a server from a data URL
   * @param dataURL The data URL to create the file from
   * @param source The source of the data URL
   */
  static fromDataURL(dataURL: string, source: string): Promise<any>;
}
