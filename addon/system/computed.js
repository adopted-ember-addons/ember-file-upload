import Ember from 'ember';

export default function (...dependentKeys) {
  if (Ember.FEATURES['new-computed-syntax'] || Ember.VERSION.match(/^1\.13/)) {
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
