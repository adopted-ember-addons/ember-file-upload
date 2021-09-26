export default class FileReader {
  /**
   * Reads the file and returns a promise that will return the blob as ArrayBuffer.
   */
  readAsArrayBuffer(): Promise<any>;

  /**
   * Reads the file and returns a promise that will return the blob as binary string.
   *
   * This is useful for reading images or files that are not plain text.
   */
  readAsBinaryString(): Promise<string>;

  /**
   * Reads the file and returns a promise that will return the blob as data URL.
   *
   * This is useful for reading images to display as a preview in the browser.
   */
  readAsDataURL(): Promise<string>;

  /**
   * Reads the file and returns a promise that will return the blob as text.
   *
   * This is useful for reading plain text files.
   */
  readAsText(): Promise<any>;
}
