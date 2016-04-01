import Ember from 'ember';

const { RSVP } = Ember;

export default function () {
  let { resolve, reject, promise } = RSVP.defer();
  let reader = new FileReader();

  reader.onload = resolve;
  reader.onerror = reject;

  let aborted = RSVP.defer();
  promise.cancel = function () {
    reader.abort();
    return aborted.promise;
  };
  reader.onabort = function () {
    aborted.resolve();
  };

  ['readAsArrayBuffer', 'readAsDataURL', 'readAsBinaryString', 'readAsText'].forEach((methodName) => {
    this[methodName] = function (blob) {
      reader[methodName](blob);
      return promise.then(function () {
        return reader.result;
      }, function () {
        return RSVP.reject(reader.error);
      });
    };
  });
}
