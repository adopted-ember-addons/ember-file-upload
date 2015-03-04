import trim from 'ember-plupload/system/trim';
import {
  module,
  test
} from 'qunit';

module('trim');

test('trims whitespace from strings', function (assert) {
  assert.equal(trim('    trim me        '), 'trim me');
});

test('returns an empty string if null is provided', function (assert) {
  assert.equal(trim(null), '');
});
