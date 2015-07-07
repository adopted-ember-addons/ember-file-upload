import Ember from 'ember';

var get = Ember.get;

export default function (target, key) {
  return Ember.A(target).reduce(function (E, obj) {
    return E + get(obj, key);
  }, 0);
}
