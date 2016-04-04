import Ember from 'ember';
import sumBy from 'ember-file-upload/computed/sum-by';
import {
  module,
  test
} from 'qunit';

module('computed:sum-by');

test('property updates when objects are pushed onto the collection', function (assert) {
  let queue = Ember.Object.extend({
    files: Ember.A(),
    size: sumBy('files.@each.size')
  }).create();

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
  let queue = Ember.Object.extend({
    files: Ember.A([
      { loaded: 0 },
      { loaded: 512 }
    ]),
    loaded: sumBy('files.@each.loaded')
  }).create();

  assert.equal(queue.get('loaded'), 512);

  Ember.run(function () {
    queue.set('files.firstObject.loaded', 128);
  });

  assert.equal(queue.get('loaded'), 640);
});

test('compatability with ArrayProxy', function (assert) {
  let queue = Ember.ArrayProxy.extend({
    size: sumBy('@each.size')
  }).create({
    content: Ember.A([])
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
