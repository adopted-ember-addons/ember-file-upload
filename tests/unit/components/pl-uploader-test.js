/* global plupload */
import {
  moduleForComponent,
  test
} from 'ember-qunit';
import Ember from "ember";
import FileUploadManager from "ember-plupload/system/file-upload-manager";
import MockUploader from '../../helpers/mock-uploader';

var get = Ember.get;
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
  var manager = FileUploadManager.create();

  // creates the component instance
  var component = this.subject({
    for: 'browse-button',
    "when-queued": 'uploadImage',
    action: 'https://my-bucket.amazonaws.com/test',
    accept: 'text/plain',
    extensions: 'JPG PNG GIF',
    "multipart-params": {
      signature: 'test'
    },
    "max-file-size": 256,
    "no-duplicates": true,
    "max-retries": 2,
    "chunk-size": 128,
    fileUploadManager: manager
  });

  // renders the component to the page
  this.render();

  var uploader = get(component, 'fileBucket.queues.firstObject');
  var elementId = get(component, 'elementId');

  assert.deepEqual(uploader.config, {
    runtimes: 'html5,html4,flash,silverlight',
    url: 'https://my-bucket.amazonaws.com/test',
    on_queued: 'uploadImage',
    browse_button: 'browse-button',
    drop_element: get(component, 'features.drag-and-drop') ? 'dropzone-for-' + elementId : null,
    container: elementId,
    flash_swf_url: '/assets/Moxie.swf',
    silverlight_xap_url: '/assets/Moxie.xap',
    max_retries: 2,
    chunk_size: 128,
    multipart_params: {
      signature: 'test'
    },
    filters: {
      mime_types: [{
        extensions: 'jpg,png,gif'
      }],
      max_file_size: 256,
      preventDuplicates: true
    },
    headers: {
      Accept: 'text/plain'
    }
  });
});
