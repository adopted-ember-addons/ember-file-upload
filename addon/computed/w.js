import Ember from 'ember';

var w = Ember.String.w;
var computed = Ember.computed;

var toArray = function (value) {
  if (typeof value === 'string') {
    value = w(value);
  }
  return Ember.A(value);
};

export default function(defaultValue) {
  defaultValue = defaultValue || [];
  return computed({
    get() {
      return toArray(defaultValue);
    },
    set(key, value) {
      return toArray(value);
    }
  });
}
