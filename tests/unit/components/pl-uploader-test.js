/* global plupload */
import {
  moduleForComponent,
  test
} from 'ember-qunit';
import Ember from "ember";
import UploadQueueManager from "ember-plupload/system/upload-queue-manager";
import MockUploader from '../../helpers/mock-uploader';

var get = Ember.get;
var set = Ember.set;
var originalPlupload;

moduleForComponent('pl-uploader', {
  // specify the other units that are required for this test
  // needs: ['component:foo', 'helper:bar']
  beforeEach: function () {
    originalPlupload = plupload.Uploader;
    plupload.Uploader = MockUploader;
  },
  afterEach: function () {
    plupload.Uploader = originalPlupload;
  }
});

test('it configures the plupload Uploader correctly', function (assert) {
  var component = this.subject({
    for: 'browse-button',
    "when-queued": 'uploadImage',
    extensions: 'JPG PNG GIF',
    "max-file-size": 256,
    "no-duplicates": true,
    uploadQueueManager: UploadQueueManager.create()
  });

  this.render();

  var uploader = get(component, 'queue.queues.firstObject');
  var elementId = get(component, 'elementId');

  assert.ok(uploader.initialized);
  assert.deepEqual(uploader.config, {
    runtimes: 'html5,html4,flash,silverlight',
    browse_button: 'browse-button',
    drop_element: get(component, 'features.drag-and-drop') ? 'dropzone-for-' + elementId : null,
    container: elementId,
    flash_swf_url: '/assets/Moxie.swf',
    silverlight_xap_url: '/assets/Moxie.xap',
    required_features: true,
    unique_names: false,
    multi_selection: true,
    filters: {
      mime_types: [{
        extensions: 'jpg,png,gif'
      }],
      max_file_size: 256,
      prevent_duplicates: true
    }
  });
});

test('sends an event when the file is queued', function (assert) {
  assert.expect(7);
  var target = {
    uploadImage: function (file, env) {
      assert.equal(get(file, 'id'), 'test');
      assert.equal(get(file, 'name'), 'test-filename.jpg');
      assert.equal(get(file, 'size'), 2000);
      assert.equal(get(file, 'progress'), 0);
      assert.equal(env.name, 'test-component');
      assert.equal(env.uploader, uploader);
      assert.ok(!env.uploader.started);
    }
  };

  var component = this.subject({
    name: 'test-component',
    "when-queued": 'uploadImage',
    uploadQueueManager: UploadQueueManager.create()
  });

  this.render();
  set(component, 'targetObject', target);

  var uploader = get(component, 'queue.queues.firstObject');
  uploader.FilesAdded(uploader, [{
    id: 'test',
    name: 'test-filename.jpg',
    size: 2000,
    percent: 0
  }]);
});

test('resolves file.upload when the file upload succeeds', function (assert) {
  var done = assert.async();
  assert.expect(4);
  var target = {
    uploadImage: function (file, env) {
      file.upload().then(function (response) {
        assert.equal(response.status, 200);
        assert.deepEqual(response.body, {
          name: 'test-filename.jpg'
        });
        assert.deepEqual(response.headers, {
          Location: 'https://my-server.com/remote-url.jpg',
          'Content-Type': 'application/json; charset=utf-8'
        });
      });
    }
  };

  var component = this.subject({
    "when-queued": 'uploadImage',
    uploadQueueManager: UploadQueueManager.create()
  });

  this.render();
  set(component, 'targetObject', target);

  var uploader = get(component, 'queue.queues.firstObject');
  var file = { id: 'test' };

  uploader.FilesAdded(uploader, [file]);
  setTimeout(function () {
    assert.ok(uploader.started);
    uploader.FileUploaded(uploader, file, {
      status: 200,
      responseHeaders: "Location: https://my-server.com/remote-url.jpg\nContent-Type: application/json; charset=utf-8",
      response: '{ "name": "test-filename.jpg" }'
    });
    done();
  }, 100);
});

test('merges uploader settings with the settings provided in file.upload', function (assert) {
  var done = assert.async();
  assert.expect(2);
  var target = {
    uploadImage: function (file, env) {
      file.upload({
        url: 'https://my-bucket.amazonaws.com/test',
        accepts: 'text/plain',
        data: {
          signature: 'test'
        },
        maxRetries: 2,
        chunkSize: 128
      });
    }
  };

  var component = this.subject({
    for: 'browse-button',
    "when-queued": 'uploadImage',
    extensions: 'JPG PNG GIF',
    "max-file-size": 256,
    "no-duplicates": true,
    uploadQueueManager: UploadQueueManager.create()
  });
  var elementId = get(component, 'elementId');

  this.render();
  set(component, 'targetObject', target);

  var uploader = get(component, 'queue.queues.firstObject');
  var file = { id: 'test' };

  uploader.FilesAdded(uploader, [file]);
  setTimeout(function () {
    assert.ok(uploader.started);

    uploader.BeforeUpload(uploader, file);
    assert.deepEqual(uploader.config, {
      runtimes: 'html5,html4,flash,silverlight',
      url: 'https://my-bucket.amazonaws.com/test',
      browse_button: 'browse-button',
      drop_element: get(component, 'features.drag-and-drop') ? 'dropzone-for-' + elementId : null,
      container: elementId,
      flash_swf_url: '/assets/Moxie.swf',
      silverlight_xap_url: '/assets/Moxie.xap',
      max_retries: 2,
      chunk_size: 128,
      multipart: true,
      multipart_params: {
        signature: 'test'
      },
      required_features: true,
      file_data_name: 'file',
      unique_names: false,
      multi_selection: true,
      filters: {
        mime_types: [{
          extensions: 'jpg,png,gif'
        }],
        max_file_size: 256,
        prevent_duplicates: true
      },
      headers: {
        Accept: 'text/plain'
      }
    });
    done();
  }, 100);
});

test('merges the url correctly if passed in as the first parameter to upload', function (assert) {
  var done = assert.async();
  assert.expect(2);
  var target = {
    uploadImage: function (file, env) {
      file.upload('https://my-bucket.amazonaws.com/test', {
        accepts: 'text/plain',
        data: {
          signature: 'test'
        },
        maxRetries: 2,
        chunkSize: 128
      });
    }
  };

  var component = this.subject({
    for: 'browse-button',
    "when-queued": 'uploadImage',
    extensions: 'JPG PNG GIF',
    "max-file-size": 256,
    "no-duplicates": true,
    uploadQueueManager: UploadQueueManager.create()
  });
  var elementId = get(component, 'elementId');

  this.render();
  set(component, 'targetObject', target);

  var uploader = get(component, 'queue.queues.firstObject');
  var file = { id: 'test' };

  uploader.FilesAdded(uploader, [file]);
  setTimeout(function () {
    assert.ok(uploader.started);

    uploader.BeforeUpload(uploader, file);
    assert.deepEqual(uploader.config, {
      runtimes: 'html5,html4,flash,silverlight',
      url: 'https://my-bucket.amazonaws.com/test',
      browse_button: 'browse-button',
      drop_element: get(component, 'features.drag-and-drop') ? 'dropzone-for-' + elementId : null,
      container: elementId,
      flash_swf_url: '/assets/Moxie.swf',
      silverlight_xap_url: '/assets/Moxie.xap',
      max_retries: 2,
      chunk_size: 128,
      multipart: true,
      multipart_params: {
        signature: 'test'
      },
      required_features: true,
      file_data_name: 'file',
      unique_names: false,
      multi_selection: true,
      filters: {
        mime_types: [{
          extensions: 'jpg,png,gif'
        }],
        max_file_size: 256,
        prevent_duplicates: true
      },
      headers: {
        Accept: 'text/plain'
      }
    });
    done();
  }, 100);
});

test('rejects file.upload when the file upload fails', function (assert) {
  var done = assert.async();
  assert.expect(4);
  var target = {
    uploadImage: function (file, env) {
      file.upload().then(null, function (response) {
        assert.equal(response.status, 404);
        assert.equal(response.body, 'oops');
        assert.deepEqual(response.headers, {});
      });
    }
  };

  // creates the component instance
  var component = this.subject({
    "when-queued": 'uploadImage',
    uploadQueueManager: UploadQueueManager.create()
  });

  // renders the component to the page
  this.render();
  set(component, 'targetObject', target);

  var uploader = get(component, 'queue.queues.firstObject');
  var file = { id: 'test' };

  uploader.FilesAdded(uploader, [file]);
  setTimeout(function () {
    assert.ok(uploader.started);
    uploader.FileUploaded(uploader, file, {
      status: 404,
      responseHeaders: '',
      response: 'oops'
    });
    done();
  }, 100);
});
