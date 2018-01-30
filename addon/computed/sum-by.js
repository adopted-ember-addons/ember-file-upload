import { computed, get } from '@ember/object';

export default function (collectionKey, itemKey) {
  return computed(`${collectionKey}.@each.${itemKey}`, function () {
    let collection = get(this, collectionKey);

    return collection.reduce(function (sum, item) {
      return sum + get(item, itemKey);
    }, 0);
  });
}
