import Ember from 'ember';

export default function (...dependentKeys) {
  if (Ember.FEATURES['new-computed-syntax']) {
    return Ember.computed(...dependentKeys);
  } else {
    let method = dependentKeys.pop();
    var property = Ember.computed(...dependentKeys, function (key, value) {
      if (arguments.length > 1) {
        return method.set.call(this, key, value);
      }
      return method.get.call(this, key);
    });

    if (method.set == null) {
      return property.readOnly();
    }
    return property;
  }
}
