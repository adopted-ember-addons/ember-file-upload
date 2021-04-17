/* global requirejs */
import { module, test } from 'qunit';

module('uuid', function () {
  let unit = function (name) {
    let module = {};
    requirejs.entries['ember-file-upload/system/uuid'].callback(module);
    let uuid = module['default'];

    test(name + ' long', function (assert) {
      assert.equal(uuid().length, 36, 'length');
      assert.ok(
        /^[a-f\d]{8}-[a-f\d]{4}-[a-f\d]{4}-[a-f\d]{4}-[a-f\d]{12}$/.test(
          uuid()
        ),
        'looks like a full uuid'
      );
      assert.notEqual(uuid(), uuid(), 'each uuid is unique');
    });

    test(name + ' short', function (assert) {
      assert.equal(uuid.short().length, 5, 'length');
      assert.ok(/^[a-f\d]{5}$/.test(uuid.short()), 'looks like a short uuid');
      assert.notEqual(uuid.short(), uuid.short(), 'each short uuid is unique');
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
