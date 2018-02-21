import { get } from '@ember/object';
import { run } from '@ember/runloop';
import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('service:file-queue', function(hooks) {
  setupTest(hooks);

  test('the size of the queue is the aggregate of all queues', function (assert) {
    var queue = this.owner.lookup('service:file-queue');
    var queue1 = run(queue, 'create', 'queue1');
    var queue2 = run(queue, 'create', 'queue2');
    run(queue, 'create', 'queue3');

    assert.equal(get(queue, 'files.length'), 0);
    assert.equal(get(queue, 'size'), 0);
    assert.equal(get(queue, 'loaded'), 0);
    assert.equal(get(queue, 'progress'), 0);

    queue1.push({
      id: 'test',
      name: 'test-filename.jpg',
      size: 2000,
      loaded: 0
    });

    assert.equal(get(queue, 'files.length'), 1);
    assert.equal(get(queue, 'size'), 2000);
    assert.equal(get(queue, 'loaded'), 0);
    assert.equal(get(queue, 'progress'), 0);

    queue2.push({
      id: 'test1',
      name: 'test-filename.jpg',
      size: 3500,
      loaded: 0
    });

    assert.equal(get(queue, 'files.length'), 2);
    assert.equal(get(queue, 'size'), 5500);
    assert.equal(get(queue, 'loaded'), 0);
    assert.equal(get(queue, 'progress'), 0);

    queue2.push({
      id: 'test2',
      name: 'test-filename.jpg',
      size: 1400,
      loaded: 0
    });

    assert.equal(get(queue, 'files.length'), 3);
    assert.equal(get(queue, 'size'), 6900);
    assert.equal(get(queue, 'loaded'), 0);
    assert.equal(get(queue, 'progress'), 0);
  });

  test('the uploaded size of the queue is the aggregate of all queues', function (assert) {
    var queue = this.owner.lookup('service:file-queue');
    var queue1 = run(queue, 'create', 'queue1');

    assert.equal(get(queue, 'files.length'), 0);
    assert.equal(get(queue, 'size'), 0);
    assert.equal(get(queue, 'loaded'), 0);
    assert.equal(get(queue, 'progress'), 0);

    queue1.push({
      id: 'test',
      name: 'test-filename.jpg',
      size: 2000,
      loaded: 500
    });

    assert.equal(get(queue, 'files.length'), 1);
    assert.equal(get(queue, 'size'), 2000);
    assert.equal(get(queue, 'loaded'), 500);
    assert.equal(get(queue, 'progress'), 25);

    var queue2 = run(queue, 'create', 'queue2');

    queue2.push({
      id: 'test1',
      name: 'test-filename.jpg',
      size: 3500,
      loaded: 500
    });

    assert.equal(get(queue, 'files.length'), 2);
    assert.equal(get(queue, 'size'), 5500);
    assert.equal(get(queue, 'loaded'), 1000);
    assert.equal(get(queue, 'progress'), 18);

    run(queue, 'create', 'queue3');

    queue2.push({
      id: 'test2',
      name: 'test-filename.jpg',
      size: 1400,
      loaded: 1000
    });

    assert.equal(get(queue, 'files.length'), 3);
    assert.equal(get(queue, 'size'), 6900);
    assert.equal(get(queue, 'loaded'), 2000);
    assert.equal(get(queue, 'progress'), 28);
  });

  test('the queue is emptied when all files are completed', function (assert) {
    var queue = this.owner.lookup('service:file-queue');
    var queue1 = run(queue, 'create', 'queue1');

    queue1.push({
      id: 'test',
      name: 'test-filename.jpg',
      size: 2000,
      loaded: 500,
      state: 'queued'
    });

    assert.equal(get(queue, 'files.length'), 1);

    queue1.push({
      id: 'test1',
      name: 'test-filename.jpg',
      size: 3500,
      loaded: 500,
      state: 'queued'
    });

    assert.equal(get(queue, 'files.length'), 2);

    queue1.push({
      id: 'test2',
      name: 'test-filename.jpg',
      size: 1400,
      loaded: 1000,
      state: 'uploaded'
    });

    assert.equal(get(queue, 'files.length'), 3);

    queue1.set('files.0.state', 'aborted');
    assert.equal(get(queue, 'files.length'), 3);

    queue1.set('files.1.state', 'uploaded');
    assert.equal(get(queue, 'files.length'), 0);
    assert.equal(get(queue1, 'files.length'), 0);
  });
});