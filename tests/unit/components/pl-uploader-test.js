/* global plupload */
import {
  moduleForComponent,
  test
} from 'ember-qunit';
import Ember from 'ember';
import Uploader from 'ember-plupload/services/uploader';
import MockUploader from '../../helpers/mock-uploader';

var get = Ember.get;
var set = Ember.set;
var originalPlupload;

moduleForComponent('pl-uploader', {
  unit: true,
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
    onfileadd: 'uploadImage',
    extensions: 'JPG PNG GIF',
    'max-file-size': 256,
    'no-duplicates': true,
    uploader: Uploader.create()
  });

  this.render();

  var uploader = get(component, 'queue.queues.firstObject');
  var elementId = get(component, 'elementId');

  assert.ok(uploader.initialized);
  var settings = {
    url: true,
    runtimes: 'html5,html4,flash,silverlight',
    browse_button: ['browse-button'],
    container: elementId,
    flash_swf_url: '/assets/Moxie.swf',
    silverlight_xap_url: '/assets/Moxie.xap',
    unique_names: false,
    multi_selection: true,
    filters: {
      mime_types: [{
        extensions: 'jpg,png,gif'
      }],
      max_file_size: 256,
      prevent_duplicates: true
    }
  };

  if (get(component, 'dropzone.enabled')) {
    settings.drop_element = ['dropzone-for-' + elementId];
  }

  assert.deepEqual(uploader.settings, settings);
});

test('when html5 is not a runtime, drop_element is not included', function (assert) {
  var component = this.subject({
    for: 'browse-button',
    onfileadd: 'uploadImage',
    extensions: 'JPG PNG GIF',
    'max-file-size': 256,
    'no-duplicates': true,
    uploader: Uploader.create(),
    runtimes: 'html4 flash'
  });

  this.render();

  var uploader = get(component, 'queue.queues.firstObject');
  var elementId = get(component, 'elementId');

  assert.ok(uploader.initialized);
  assert.deepEqual(uploader.settings, {
    url: true,
    runtimes: 'html4,flash',
    browse_button: ['browse-button'],
    container: elementId,
    flash_swf_url: '/assets/Moxie.swf',
    silverlight_xap_url: '/assets/Moxie.xap',
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
  var component = this.subject({
    name: 'test-component',
    onfileadd: 'uploadImage',
    uploader: Uploader.create()
  });

  this.render();
  var uploader = get(component, 'queue.queues.firstObject');
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
  set(component, 'targetObject', target);

  uploader.addFile({
    id: 'test',
    name: 'test-filename.jpg',
    size: 2000,
    percent: 0
  });
});

Ember.A([200, 201, 202, 203, 204, 206]).forEach(function (status) {
  test(`resolves a response of ${status}`, function (assert) {
    assert.expect(4);
    var target = {
      uploadImage: function (file) {
        file.upload().then(function (response) {
          assert.equal(response.status, status);
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
      onfileadd: 'uploadImage',
      uploader: Uploader.create()
    });

    this.render();
    set(component, 'targetObject', target);

    var uploader = get(component, 'queue.queues.firstObject');
    var rawFile = { id: 'test' };

    uploader.addFile(rawFile);
    assert.ok(uploader.started);
    uploader.FileUploaded(uploader, rawFile, {
      status: status,
      responseHeaders: 'Location: https://my-server.com/remote-url.jpg\nContent-Type: application/json; charset=utf-8',
      response: '{ "name": "test-filename.jpg" }'
    });
  });
});

test('merges uploader settings with the settings provided in file.upload', function (assert) {
  assert.expect(2);
  var target = {
    uploadImage: function (file) {
      file.upload({
        url: 'https://my-bucket.amazonaws.com/test',
        method: 'PUT',
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
    'for-dropzone': 'ember-application',
    onfileadd: 'uploadImage',
    extensions: 'JPG PNG GIF',
    'max-file-size': 256,
    'no-duplicates': true,
    uploader: Uploader.create()
  });
  var elementId = get(component, 'elementId');

  this.render();
  set(component, 'targetObject', target);

  var uploader = get(component, 'queue.queues.firstObject');
  var rawFile = { id: 'test', type: 'image/gif' };

  uploader.addFile(rawFile);
  assert.ok(uploader.started);

  uploader.BeforeUpload(uploader, rawFile);
  assert.deepEqual(uploader.settings, {
    runtimes: 'html5,html4,flash,silverlight',
    url: 'https://my-bucket.amazonaws.com/test',
    browse_button: ['browse-button'],
    drop_element: get(component, 'dropzone.enabled') ? ['ember-application'] : null,
    container: elementId,
    flash_swf_url: '/assets/Moxie.swf',
    silverlight_xap_url: '/assets/Moxie.xap',
    max_retries: 2,
    chunk_size: 128,
    method: 'PUT',
    multipart: true,
    multipart_params: {
      signature: 'test',
      'Content-Type': 'image/gif'
    },
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
});

test('merges the url correctly if passed in as the first parameter to upload', function (assert) {
  assert.expect(2);
  var target = {
    uploadImage: function (file) {
      file.upload('https://my-bucket.amazonaws.com/test', {
        accepts: 'text/plain',
        contentType: 'text/plain',
        multipart: false,
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
    onfileadd: 'uploadImage',
    extensions: 'JPG PNG GIF',
    'max-file-size': 256,
    'no-duplicates': true,
    uploader: Uploader.create()
  });
  var elementId = get(component, 'elementId');

  this.render();
  set(component, 'targetObject', target);

  var uploader = get(component, 'queue.queues.firstObject');
  var rawFile = { id: 'test', type: 'image/gif' };

  uploader.addFile(rawFile);
  assert.ok(uploader.started);

  uploader.BeforeUpload(uploader, rawFile);
  assert.deepEqual(uploader.settings, {
    runtimes: 'html5,html4,flash,silverlight',
    url: 'https://my-bucket.amazonaws.com/test',
    browse_button: ['browse-button'],
    drop_element: get(component, 'dropzone.enabled') ? ['dropzone-for-' + elementId] : null,
    container: elementId,
    flash_swf_url: '/assets/Moxie.swf',
    silverlight_xap_url: '/assets/Moxie.xap',
    max_retries: 2,
    chunk_size: 128,
    method: 'POST',
    multipart: false,
    multipart_params: {
      signature: 'test'
    },
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
      Accept: 'text/plain',
      'Content-Type': 'text/plain'
    }
  });
});

test('use url correctly if it is the only argument', function (assert) {
  assert.expect(2);
  var target = {
    uploadImage: function (file) {
      file.upload('https://my-bucket.amazonaws.com/test');
    }
  };

  var component = this.subject({
    for: 'browse-button',
    onfileadd: 'uploadImage',
    extensions: 'JPG PNG GIF',
    'max-file-size': 256,
    'no-duplicates': true,
    uploader: Uploader.create()
  });
  var elementId = get(component, 'elementId');

  this.render();
  set(component, 'targetObject', target);

  var uploader = get(component, 'queue.queues.firstObject');
  var rawFile = { id: 'test', type: 'image/gif' };

  uploader.addFile(rawFile);
  assert.ok(uploader.started);

  uploader.BeforeUpload(uploader, rawFile);
  assert.deepEqual(uploader.settings, {
    runtimes: 'html5,html4,flash,silverlight',
    url: 'https://my-bucket.amazonaws.com/test',
    browse_button: ['browse-button'],
    drop_element: get(component, 'dropzone.enabled') ? ['dropzone-for-' + elementId] : null,
    container: elementId,
    flash_swf_url: '/assets/Moxie.swf',
    silverlight_xap_url: '/assets/Moxie.xap',
    max_retries: 0,
    chunk_size: 0,
    method: 'POST',
    multipart: true,
    multipart_params: {
      'Content-Type': 'image/gif'
    },
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
      Accept: 'application/json,text/javascript'
    }
  });
});

test('rejects file.upload when the file upload fails', function (assert) {
  assert.expect(4);
  var target = {
    uploadImage: function (file) {
      file.upload().then(null, function (response) {
        assert.equal(response.status, 404);
        assert.equal(response.body, 'oops');
        assert.deepEqual(response.headers, {});
      });
    }
  };

  // creates the component instance
  var component = this.subject({
    onfileadd: 'uploadImage',
    uploader: Uploader.create()
  });

  // renders the component to the page
  this.render();
  set(component, 'targetObject', target);

  var uploader = get(component, 'queue.queues.firstObject');
  var rawFile = { id: 'test' };

  uploader.addFile(rawFile);
  assert.ok(uploader.started);
  uploader.FileUploaded(uploader, rawFile, {
    status: 404,
    responseHeaders: '',
    response: 'oops'
  });
});

test('plupload.File.upload is called if it is defined', function (assert) {
  assert.expect(1);
  var target = {
    uploadImage: function (file) {
      file.upload({
        url: 'https://my-bucket.amazonaws.com/test',
        method: 'PUT',
        accepts: 'text/plain',
        data: {
          signature: 'test'
        },
        maxRetries: 2,
        chunkSize: 128
      });
    }
  };

  // creates the component instance
  var component = this.subject({
    onfileadd: 'uploadImage',
    uploader: Uploader.create()
  });

  // renders the component to the page
  this.render();
  set(component, 'targetObject', target);

  var uploader = get(component, 'queue.queues.firstObject');
  var rawFile = {
    id: 'test',
    upload(settings) {
      assert.deepEqual(settings, {
        url: 'https://my-bucket.amazonaws.com/test',
        method: 'PUT',
        multipart: true,
        file_data_name: 'file',
        multipart_params: {
          signature: 'test'
        },
        headers: {
          Accept: 'text/plain'
        },
        max_retries: 2,
        chunk_size: 128
      });
    }
  };

  uploader.addFile(rawFile);
});
