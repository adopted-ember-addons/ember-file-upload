import Ember from 'ember';
import FileBucket from 'ember-plupload/system/file_bucket';
import MockUploader from '../../helpers/mock-uploader';
import {
  module,
  test
} from 'qunit';

var get = Ember.get;
var bind = Ember.run.bind;

FileBucket.reopen({
  makeQueue: function (mock) {
    mock.bind('FilesAdded',     bind(this, 'filesAdded'));
    mock.bind('FilesRemoved',   bind(this, 'filesRemoved'));
    mock.bind('BeforeUpload',   bind(this, 'progressDidChange'));
    mock.bind('UploadProgress', bind(this, 'progressDidChange'));
    mock.bind('FileUploaded',   bind(this, 'fileUploaded'));
    mock.bind('UploadComplete', bind(this, 'uploadComplete'));
    mock.bind('Error',          bind(this, 'onError'));

    get(this, 'queues').pushObject(mock);
  }
});

module('FileBucket');

test('manages the lifecycle of uploaders (nothing queued)', function (assert) {
  var bucket = FileBucket.create();
  assert.equal(get(bucket, 'length'), 0);

  var uploader = new MockUploader();
  bucket.makeQueue(uploader);
  assert.equal(get(bucket, 'queues.length'), 1);

  bucket.orphan();
  assert.equal(get(bucket, 'queues.length'), 0);
  assert.ok(uploader.unbound);
});

test('manages the lifecycle of uploaders (with queued items)', function (assert) {
  var bucket = FileBucket.create();
  assert.equal(get(bucket, 'length'), 0);

  var uploader = new MockUploader();
  bucket.makeQueue(uploader);
  assert.equal(get(bucket, 'queues.length'), 1);
  uploader.total.queued = 1;

  bucket.orphan();
  assert.equal(get(bucket, 'queues.length'), 1);
  uploader.UploadComplete(uploader);
  assert.equal(get(bucket, 'queues.length'), 0);
  assert.ok(uploader.unbound);
});

test('multiple uploaders can be handled simultaneously', function (assert) {
  var bucket = FileBucket.create();
  var uploader = new MockUploader();
  uploader.total.queued = 1;
  bucket.makeQueue(uploader);
  assert.equal(get(bucket, 'queues.length'), 1);
  bucket.orphan();

  var uploader2 = new MockUploader();
  uploader2.total.queued = 1;
  bucket.makeQueue(uploader2);
  assert.equal(get(bucket, 'queues.length'), 2);
  bucket.orphan();

  uploader2.UploadComplete(uploader2);
  assert.equal(get(bucket, 'queues.length'), 1);
  uploader.UploadComplete(uploader);
  assert.equal(get(bucket, 'queues.length'), 0);
});

test('the progress property is computed from the totals of each uploader', function (assert) {
  var bucket = FileBucket.create();
  var uploader = new MockUploader();
  var uploader2 = new MockUploader();

  bucket.makeQueue(uploader);
  bucket.makeQueue(uploader2);

  uploader.total.size = 7000;
  uploader2.total.size = 3000;

  uploader.total.loaded = 5500;
  uploader2.total.loaded = 2000;

  uploader.UploadProgress(uploader, {});
  assert.equal(get(bucket, 'progress'), 75);
});

test('the queued action is triggered when a file is added', function (assert) {
  assert.expect(6);
  var uploader = new MockUploader();
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

  var bucket = FileBucket.create({
    name: 'my-uploader',
    onQueued: 'queued',
    target: router
  });

  bucket.makeQueue(uploader);
  uploader.FilesAdded(uploader, [{
    id: 'test',
    name: 'test-filename.jpg',
    size: 2000,
    percent: 0
  }]);
});

test('a successful file upload', function (assert) {
  var done = assert.async();

  var uploader = new MockUploader();
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

  var bucket = FileBucket.create({
    name: 'my-uploader',
    onQueued: 'queued',
    target: router
  });

  bucket.makeQueue(uploader);
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

  var uploader = new MockUploader();
  var router = Ember.Object.create({
    queued: function (file) {
      file.upload().then(null, function (response) {
        assert.equal(response.status, 404);
        assert.equal(response.body, 'oops');
        assert.deepEqual(response.headers, {});
      });
    }
  });

  var bucket = FileBucket.create({
    name: 'my-uploader',
    onQueued: 'queued',
    target: router
  });

  bucket.makeQueue(uploader);
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
