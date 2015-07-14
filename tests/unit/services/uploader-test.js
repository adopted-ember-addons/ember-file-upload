/* global plupload */
import Ember from 'ember';
import Uploader from 'ember-plupload/services/uploader';
import MockUploader from '../../helpers/mock-uploader';
import {
  module,
  test
} from 'qunit';

var get = Ember.get;
var originalPlupload;

module('service:uploader', {
  beforeEach: function () {
    originalPlupload = plupload.Uploader;
    plupload.Uploader = MockUploader;
  },
  afterEach: function () {
    plupload.Uploader = originalPlupload;
  }
});

test('the size of the uploader is the aggregate of all queues', function (assert) {
  var uploader = Uploader.create();
  var queue1 = uploader.findOrCreate('queue1', Ember.Component.create(), {});
  var queue2 = uploader.findOrCreate('queue2', Ember.Component.create(), {});
  uploader.findOrCreate('queue3', Ember.Component.create(), {});

  assert.equal(get(uploader, 'files.length'), 0);
  assert.equal(get(uploader, 'size'), 0);
  assert.equal(get(uploader, 'loaded'), 0);
  assert.equal(get(uploader, 'progress'), 0);

  get(queue1, 'queues.firstObject').addFile({
    id: 'test',
    name: 'test-filename.jpg',
    size: 2000,
    percent: 0
  });

  assert.equal(get(uploader, 'files.length'), 1);
  assert.equal(get(uploader, 'size'), 2000);
  assert.equal(get(uploader, 'loaded'), 0);
  assert.equal(get(uploader, 'progress'), 0);

  get(queue2, 'queues.firstObject').addFile({
    id: 'test1',
    name: 'test-filename.jpg',
    size: 3500,
    percent: 0
  });

  assert.equal(get(uploader, 'files.length'), 2);
  assert.equal(get(uploader, 'size'), 5500);
  assert.equal(get(uploader, 'loaded'), 0);
  assert.equal(get(uploader, 'progress'), 0);

  get(queue2, 'queues.firstObject').addFile({
    id: 'test2',
    name: 'test-filename.jpg',
    size: 1400,
    percent: 0
  });

  assert.equal(get(uploader, 'files.length'), 3);
  assert.equal(get(uploader, 'size'), 6900);
  assert.equal(get(uploader, 'loaded'), 0);
  assert.equal(get(uploader, 'progress'), 0);
});

test('the uploaded size of the uploader is the aggregate of all queues', function (assert) {
  var uploader = Uploader.create();
  var queue1 = uploader.findOrCreate('queue1', Ember.Component.create(), {});
  var queue2 = uploader.findOrCreate('queue2', Ember.Component.create(), {});
  uploader.findOrCreate('queue3', Ember.Component.create(), {});

  assert.equal(get(uploader, 'files.length'), 0);
  assert.equal(get(uploader, 'size'), 0);
  assert.equal(get(uploader, 'loaded'), 0);
  assert.equal(get(uploader, 'progress'), 0);

  get(queue1, 'queues.firstObject').addFile({
    id: 'test',
    name: 'test-filename.jpg',
    size: 2000,
    loaded: 500
  });

  assert.equal(get(uploader, 'files.length'), 1);
  assert.equal(get(uploader, 'size'), 2000);
  assert.equal(get(uploader, 'loaded'), 500);
  assert.equal(get(uploader, 'progress'), 25);

  get(queue2, 'queues.firstObject').addFile({
    id: 'test1',
    name: 'test-filename.jpg',
    size: 3500,
    loaded: 500
  });

  assert.equal(get(uploader, 'files.length'), 2);
  assert.equal(get(uploader, 'size'), 5500);
  assert.equal(get(uploader, 'loaded'), 1000);
  assert.equal(get(uploader, 'progress'), 18);

  get(queue2, 'queues.firstObject').addFile({
    id: 'test2',
    name: 'test-filename.jpg',
    size: 1400,
    loaded: 1000
  });

  assert.equal(get(uploader, 'files.length'), 3);
  assert.equal(get(uploader, 'size'), 6900);
  assert.equal(get(uploader, 'loaded'), 2000);
  assert.equal(get(uploader, 'progress'), 28);
});
