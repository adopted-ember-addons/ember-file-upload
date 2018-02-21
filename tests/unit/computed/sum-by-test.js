import { run } from '@ember/runloop';
import { A } from '@ember/array';
import EmberObject from '@ember/object';
import sumBy from 'ember-file-upload/computed/sum-by';
import {
  module,
  test
} from 'qunit';

module('computed:sum-by', function() {
  test('property updates when objects are pushed onto the collection', function (assert) {
    let queue = EmberObject.extend({
      files: A(),
      size: sumBy('files', 'size')
    }).create();

    assert.equal(queue.get('size'), 0);

    run(function () {
      let files = queue.get('files');
      files.pushObject({
        size: 256
      });
    });

    assert.equal(queue.get('size'), 256);

    run(function () {
      let files = queue.get('files');
      files.pushObject({
        size: 512
      });
    });

    assert.equal(queue.get('size'), 768);
  });

  test('property updates when the item property updates', function (assert) {
    let queue = EmberObject.extend({
      files: A([
        { loaded: 0 },
        { loaded: 512 }
      ]),
      loaded: sumBy('files', 'loaded')
    }).create();

    assert.equal(queue.get('loaded'), 512);

    run(function () {
      queue.set('files.firstObject.loaded', 128);
    });

    assert.equal(queue.get('loaded'), 640);
  });
});