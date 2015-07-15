/* global plupload */
import Ember from 'ember';

var RSVP = Ember.RSVP;

export default function (name, filterBody) {
  plupload.addFileFilter(name, function (configValue, file, callback) {
    var deferred = RSVP.defer();
    var self = this;

    filterBody(configValue, file, deferred.resolve, deferred.reject);
    deferred.promise.then(function () {
      callback(true);
    }, function (code, message) {
      self.trigger('Error', {
        code: code,
        message: message,
        file: file
      });
      callback(false);
    });
  });
}
