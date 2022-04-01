import RSVP from 'rsvp';

/**
  Provides a promise-aware interface for reading files.

  ```js
  import UploadFile from 'ember-file-upload/upload-file';
  import UploadFileReader from 'ember-file-upload/system/file-reader';

  let reader = new UploadFileReader();
  let file = File.fromDataURL('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAUAAAAFCAYAAACNbyblAAAAAXNSR0IArs4c6QAAACNJREFUCB1jYICC6dOn/4exwTRMAEYzwBnoOmASMBpuDLIAAIVVFiE0cg0oAAAAAElFTkSuQmCC');

  reader.readAsDataURL(file.blob).then((url) => {
    return url;
  }, function (err) {
    console.error(err);
  });
  ```

  Promises can be aborted, which will cancel the file upload:

  ```js
  let promise = reader.readAsDataURL(file.blob);
  promise.then((url) => {
    return url;
  }, (err) => {
    console.error(err);
  });

  promise.abort().then(() => {
    console.error('cancelled reading file');
  });
  ```

  @class UploadFileReader
  @constructor
  @param [options] An object with a label to use to mark the promise.
 */
export default class UploadFileReader {
  label;
  reader;
  promise;
  aborted: RSVP.Deferred<unknown> | undefined;

  constructor(options: { label: string } = { label: '' }) {
    this.label = options.label;

    const { resolve, reject, promise } = RSVP.defer(
      `ember-file-upload: ${this.label}`
    );

    this.promise = promise;
    this.reader = new FileReader();
    this.reader.onload = resolve;
    this.reader.onerror = reject;
    this.reader.onabort = () => {
      this.aborted?.resolve();
    };
  }

  /**
    Reads the file and returns a promise that will
    return the blob as ArrayBuffer.

    @method readAsArrayBuffer
    @return {Promise} A promise that will return the file as an ArrayBuffer
   */
  readAsArrayBuffer(blob: Blob) {
    return this.read('readAsArrayBuffer', blob);
  }

  /**
    Reads the file and returns a promise that will
    return the blob as data URL.

    This is useful for reading images to display
    as a preview in the browser.

    @method readAsDataURL
    @return {Promise} A promise that will return the file as a data URL
   */
  readAsDataURL(blob: Blob) {
    return this.read('readAsDataURL', blob);
  }

  /**
    Reads the file and returns a promise that will
    return the blob as binary string.

    This is useful for reading images or files that
    are not plain text.

    @method readAsBinaryString
    @return {Promise} A promise that will return the file as a binary string
   */
  readAsBinaryString(blob: Blob) {
    return this.read('readAsBinaryString', blob);
  }

  /**
    Reads the file and returns a promise that will
    return the blob as text.

    This is useful for reading plain text files.

    @method readAsText
    @return {Promise} A promise that will return the file as text
   */
  readAsText(blob: Blob) {
    return this.read('readAsText', blob);
  }

  read(
    methodName:
      | 'readAsArrayBuffer'
      | 'readAsDataURL'
      | 'readAsBinaryString'
      | 'readAsText',
    blob: Blob
  ) {
    this.reader[methodName](blob);
    const promise = this.promise.then(
      () => {
        return this.reader.result;
      },
      () => {
        return RSVP.reject(this.reader.error);
      },
      `ember-file-upload: Unpack ${this.label}`
    );
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    promise.cancel = () => {
      if (this.aborted == null) {
        this.aborted = RSVP.defer(`ember-file-upload: Abort ${this.label}`);
        this.reader.abort();
      }
      return this.aborted.promise;
    };
    return promise;
  }
}
