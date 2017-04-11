import Ember from 'ember';

const { RSVP } = Ember;

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
