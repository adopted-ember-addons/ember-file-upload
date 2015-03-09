/* global plupload */
import Ember from 'ember';
import UploadQueue from 'ember-plupload/system/upload-queue';
import MockUploader from '../../helpers/mock-uploader';
import {
  module,
  test
} from 'qunit';

var get = Ember.get;
var bind = Ember.run.bind;
var originalPlupload;

module('UploadQueue', {
  beforeEach: function () {
    originalPlupload = plupload.Uploader;
    plupload.Uploader = MockUploader;
  },
  afterEach: function () {
    plupload.Uploader = originalPlupload;
  }
});

test('manages the lifecycle of uploaders (nothing queued)', function (assert) {
  var queue = UploadQueue.create();
  assert.equal(get(queue, 'length'), 0);

  var uploader = queue.configure();
  assert.equal(get(queue, 'queues.length'), 1);

  queue.orphan();
  assert.equal(get(queue, 'queues.length'), 0);
  assert.ok(uploader.unbound);
});

test('manages the lifecycle of uploaders (with queued items)', function (assert) {
  var queue = UploadQueue.create();
  assert.equal(get(queue, 'length'), 0);

  var uploader = queue.configure();
  assert.equal(get(queue, 'queues.length'), 1);
  uploader.total.queued = 1;

  queue.orphan();
  assert.equal(get(queue, 'queues.length'), 1);
  uploader.UploadComplete(uploader);
  assert.equal(get(queue, 'queues.length'), 0);
  assert.ok(uploader.unbound);
});

test('multiple uploaders can be handled simultaneously', function (assert) {
  var queue = UploadQueue.create();
  var uploader = queue.configure();
  uploader.total.queued = 1;
  assert.equal(get(queue, 'queues.length'), 1);
  queue.orphan();

  var uploader2 = queue.configure();
  uploader2.total.queued = 1;
  assert.equal(get(queue, 'queues.length'), 2);
  queue.orphan();

  uploader2.UploadComplete(uploader2);
  assert.equal(get(queue, 'queues.length'), 1);
  uploader.UploadComplete(uploader);
  assert.equal(get(queue, 'queues.length'), 0);
});

test('the progress property is computed from the totals of each uploader', function (assert) {
  var queue = UploadQueue.create();
  var uploader = queue.configure();
  var uploader2 = queue.configure();

  uploader.total.size = 7000;
  uploader2.total.size = 3000;

  uploader.total.loaded = 5500;
  uploader2.total.loaded = 2000;

  uploader.UploadProgress(uploader, {});
  assert.equal(get(queue, 'progress'), 75);
});
