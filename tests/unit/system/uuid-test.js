/* global requirejs */
import {
  module,
  test
} from 'qunit';

module('uuid', function() {
  let unit = function (name) {
    let module = {};
    requirejs.entries['ember-file-upload/system/uuid'].callback(module);
    let uuid = module['default'];

    test(name + ' long', function (assert) {
      assert.equal(uuid().length, 36);
      assert.notEqual(uuid(), uuid());
    });

    test(name + ' short', function (assert) {
      assert.equal(uuid.short().length, 5);
      assert.notEqual(uuid.short(), uuid.short());
    });
  };

  let crypto = window.crypto || window.msCrypto;
  if (crypto) {
    unit('native');

    let getRandomValues = window.crypto.getRandomValues;
    crypto.getRandomValues = null;
    unit('polyfill');
    crypto.getRandomValues = getRandomValues;
  } else {
    unit('polyfill');
  }
});
