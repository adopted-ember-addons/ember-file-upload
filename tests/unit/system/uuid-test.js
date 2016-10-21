import uuid from 'ember-file-upload/system/uuid';
import {
  module,
  test
} from 'qunit';

module('uuid');

test('long', function (assert) {
  assert.equal(uuid().length, 36);
  assert.notEqual(uuid(), uuid());
});

test('short', function (assert) {
  assert.equal(uuid.short().length, 5);
  assert.notEqual(uuid.short(), uuid.short());
});
