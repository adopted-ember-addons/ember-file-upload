import Ember from "ember";

const RSVP = Ember.RSVP;
const later = Ember.run.later;

export default Ember.Route.extend({
  model: function () {
    let deferred = RSVP.defer();
    later(function () {
      deferred.resolve({
        title: "Rails is Omakase"
      });
    }, 200);
    return deferred.promise;
  }
});
