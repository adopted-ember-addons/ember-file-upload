import Ember from 'ember';
import sumBy from 'ember-plupload/computed/sum-by';
import {
  module,
  test
} from 'qunit';

module('computed:sum-by');

test('property updates when objects are pushed onto the collection', function (assert) {
  let queue = Ember.Object.create({
    files: [],
    size: sumBy('files.@each.size')
  });

  assert.equal(queue.get('size'), 0);

  Ember.run(function () {
    let files = queue.get('files');
    files.pushObject({
      size: 256
    });
  });

  assert.equal(queue.get('size'), 256);

  Ember.run(function () {
    let files = queue.get('files');
    files.pushObject({
      size: 512
    });
  });

  assert.equal(queue.get('size'), 768);
});

test('property updates when the item property updates', function (assert) {
  let queue = Ember.Object.create({
    files: [
      { loaded: 0 },
      { loaded: 512 }
    ],
    loaded: sumBy('files.@each.loaded')
  });

  assert.equal(queue.get('loaded'), 512);

  Ember.run(function () {
    queue.set('files.firstObject', 128);
  });

  assert.equal(queue.get('size'), 640);
});

test('compatability with ArrayProxy', function (assert) {
  let queue = Ember.Object.extend(Ember.ArrayProxy).create({
    loaded: sumBy('@each.size')
  });

  assert.equal(queue.get('size'), 0);

  Ember.run(function () {
    queue.pushObject({
      size: 256
    });
  });

  assert.equal(queue.get('size'), 256);

  Ember.run(function () {
    queue.pushObject({
      size: 512
    });
  });

  assert.equal(queue.get('size'), 768);
});
