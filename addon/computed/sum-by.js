import Ember from 'ember';

var { get, computed } = Ember;

export default function (dependentKey) {
  let [collectionKey, itemKey] = dependentKey.split('@each.');

  return computed(dependentKey, function () {
    let collection = this;
    if (collectionKey) {
      collection = get(this, collectionKey);
    }

    return collection.reduce(function (sum, item) {
      return sum + get(item, itemKey);
    }, 0);
  });
}
