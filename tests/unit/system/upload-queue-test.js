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

test('the queued action is triggered when a file is added', function (assert) {
  assert.expect(6);
  var router = Ember.Object.create({
    queued: function (file, env) {
      assert.equal(get(file, 'id'), 'test');
      assert.equal(get(file, 'name'), 'test-filename.jpg');
      assert.equal(get(file, 'size'), 2000);
      assert.equal(get(file, 'progress'), 0);
      assert.equal(env.name, 'my-uploader');
      assert.equal(env.uploader, uploader);
    }
  });

  var queue = UploadQueue.create({
    name: 'my-uploader',
    onQueued: 'queued',
    target: router
  });

  var uploader = queue.configure();
  uploader.FilesAdded(uploader, [{
    id: 'test',
    name: 'test-filename.jpg',
    size: 2000,
    percent: 0
  }]);
});

test('a successful file upload', function (assert) {
  var done = assert.async();
  var router = Ember.Object.create({
    queued: function (file) {
      file.upload().then(function (response) {
        assert.equal(response.status, 200);
        assert.deepEqual(response.body, {
          name: 'test-filename.jpg'
        });
        assert.deepEqual(response.headers, {
          Location: 'https://my-server.com/remote-url.jpg',
          'Content-Type': 'application/json'
        });
      });
    }
  });

  var queue = UploadQueue.create({
    name: 'my-uploader',
    onQueued: 'queued',
    target: router
  });

  var uploader = queue.configure();
  var file = {
    id: 'test',
    name: 'test-filename.jpg',
    size: 2000,
    percent: 0
  };
  uploader.FilesAdded(uploader, [file]);
  Ember.run(function () {});

  setTimeout(function () {
    assert.ok(uploader.started);
    uploader.FileUploaded(uploader, file, {
      status: 200,
      responseHeaders: "Location: https://my-server.com/remote-url.jpg\nContent-Type: application/json",
      response: '{ "name": "test-filename.jpg" }'
    });
    done();
  }, 100);
});

test('a failed file upload', function (assert) {
  var done = assert.async();

  var router = Ember.Object.create({
    queued: function (file) {
      file.upload().then(null, function (response) {
        assert.equal(response.status, 404);
        assert.equal(response.body, 'oops');
        assert.deepEqual(response.headers, {});
      });
    }
  });

  var queue = UploadQueue.create({
    name: 'my-uploader',
    onQueued: 'queued',
    target: router
  });

  var uploader = queue.configure();
  var file = {
    id: 'test',
    name: 'test-filename.jpg',
    size: 2000,
    percent: 0
  };
  uploader.FilesAdded(uploader, [file]);
  Ember.run(function () {});

  setTimeout(function () {
    assert.ok(uploader.started);
    uploader.FileUploaded(uploader, file, {
      status: 404,
      responseHeaders: "",
      response: 'oops'
    });
    done();
  }, 100);
});
