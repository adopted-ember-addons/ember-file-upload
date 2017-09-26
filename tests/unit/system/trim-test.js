/* global requirejs */
import {
  module,
  test
} from 'qunit';

module('trim');

let unit = function (name) {
  let module = {};
  requirejs.entries['ember-file-upload/system/trim'].callback(module);
  let trim = module['default'];

  test(name + ' trims whitespace from strings', function (assert) {
    assert.equal(trim('    trim me        '), 'trim me');
  });

  test(name + ' returns an empty string if null is provided', function (assert) {
    assert.equal(trim(null), '');
  });
};

if (''.trim) {
  unit('native');
  let trim = String.prototype.trim;
  String.prototype.trim = null;
  unit('polyfill');
  String.prototype.trim = trim;
} else {
  unit('polyfill');
}
