import Ember from "ember";

const RSVP = Ember.RSVP;

export default function (plFile) {
  let file = plFile.getNative();
  let reader = new FileReader();
  let { promise, resolve, reject } = RSVP.defer();
  reader.readAsDataURL(file);
  reader.onloadend = resolve;
  reader.onerror = reject;

  return promise.then(function () {
    return reader.result;
  }, function () {
    return reader.error;
  });
}
