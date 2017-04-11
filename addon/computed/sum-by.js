import Ember from 'ember';

var { get, computed } = Ember;

export default function (collectionKey, itemKey) {
  return computed(`${collectionKey}.@each.${itemKey}`, function () {
    let collection = get(this, collectionKey);

    return collection.reduce(function (sum, item) {
      return sum + get(item, itemKey);
    }, 0);
  });
}
