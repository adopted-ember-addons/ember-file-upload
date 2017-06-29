import RSVP from 'rsvp';

/**
  Provides a promise-aware interface for reading files.

  ```js
  import File from 'ember-file-upload/file';
  import FileReader from 'ember-file-upload/system/file-reader';

  let reader = new FileReader();
  let file = File.fromDataURL('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAUAAAAFCAYAAACNbyblAAAAAXNSR0IArs4c6QAAACNJREFUCB1jYICC6dOn/4exwTRMAEYzwBnoOmASMBpuDLIAAIVVFiE0cg0oAAAAAElFTkSuQmCC');

  reader.readAsDataURL(file.blob).then(function (url) {
    return url;
  }, function (err) {
    console.error(err);
  });
  ```

  Promises can be aborted, which will cancel the file upload:

  ```js
  let promise = reader.readAsDataURL(file.blob);
  promise.then(function (url) {
    return url;
  }, function (err) {
    console.error(err);
  });

  promise.abort().then(function () {
    console.error('cancelled reading file');
  });
  ```

  @class FileReader
  @constructor
  @param [options] An object with a label to use to mark the promise.
 */
export default function (options = {}) {
  let { resolve, reject, promise } = RSVP.defer(`ember-file-upload: ${options.label}`);
  let reader = new FileReader();

  reader.onload = resolve;
  reader.onerror = reject;

  let aborted;
  let cancel = function () {
    if (aborted == null) {
      aborted = RSVP.defer(`ember-file-upload: Abort ${options.label}`);
      reader.abort();
    }
    return aborted.promise;
  };
  reader.onabort = function () {
    aborted.resolve();
  };

  /**
    Reads the file and returns a promise that will
    return the blob as ArrayBuffer.

    @method readAsArrayBuffer
    @return {Promise} A promise that will return the file as an ArrayBuffer
   */

  /**
    Reads the file and returns a promise that will
    return the blob as data URL.

    This is useful for reading images to display
    as a preview in the browser.

    @method readAsDataURL
    @return {Promise} A promise that will return the file as a data URL
   */

  /**
    Reads the file and returns a promise that will
    return the blob as binary string.

    This is useful for reading images or files that
    are not plain text.

    @method readAsBinaryString
    @return {Promise} A promise that will return the file as a binary string
   */

  /**
    Reads the file and returns a promise that will
    return the blob as text.

    This is useful for reading plain text files.

    @method readAsText
    @return {Promise} A promise that will return the file as text
   */
  ['readAsArrayBuffer', 'readAsDataURL', 'readAsBinaryString', 'readAsText'].forEach((methodName) => {
    this[methodName] = function (blob) {
      reader[methodName](blob);
      let p = promise.then(function () {
        return reader.result;
      }, function () {
        return RSVP.reject(reader.error);
      }, `ember-file-upload: Unpack ${options.label}`);
      p.cancel = cancel;
      return p;
    };
  });
}
