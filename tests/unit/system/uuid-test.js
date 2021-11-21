import { module, test } from 'qunit';
import uuid from 'ember-file-upload/system/uuid';

module('uuid', function () {
  test('long', function (assert) {
    assert.strictEqual(uuid().length, 36, 'length');
    assert.ok(
      /^[a-f\d]{8}-[a-f\d]{4}-[a-f\d]{4}-[a-f\d]{4}-[a-f\d]{12}$/.test(uuid()),
      'looks like a full uuid'
    );
    assert.notEqual(uuid(), uuid(), 'each uuid is unique');
  });

  test('short', function (assert) {
    assert.strictEqual(uuid.short().length, 5, 'length');
    assert.ok(/^[a-f\d]{5}$/.test(uuid.short()), 'looks like a short uuid');
    assert.notEqual(uuid.short(), uuid.short(), 'each short uuid is unique');
  });
});
