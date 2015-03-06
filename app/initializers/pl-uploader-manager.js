import FileUploadManager from "ember-plupload/system/file-upload-manager";

export default {
  name: 'pl-uploader',

  initialize: function (container, app) {
    app.register('app:file-upload-manager', FileUploadManager);
    app.inject('controller', 'uploader', 'app:file-upload-manager');
    app.inject('route',      'uploader', 'app:file-upload-manager');
    app.inject('app:file-upload-manager', 'router', 'router:main');

    app.inject('component', 'fileUploadManager', 'app:file-upload-manager');
  }
}
