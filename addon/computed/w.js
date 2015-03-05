import Ember from "ember";

var computed = Ember.computed;
var w = Ember.String.w;

var toArray = function (value) {
  if (typeof value === "string") {
    value = w(value);
  }
  return value;
};

export default function(defaultValue) {
  defaultValue = defaultValue || [];
  return computed(function w(key, value) {
    if (arguments.length > 1) {
      value = toArray(value);
    }
    return value || toArray(defaultValue);
  });
}
