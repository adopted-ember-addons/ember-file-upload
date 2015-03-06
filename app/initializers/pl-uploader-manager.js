import UploadQueueManager from "ember-plupload/system/upload-queue-manager";

export default {
  name: 'pl-uploader',

  initialize: function (container, app) {
    var manager = UploadQueueManager.create();
    app.register('app:upload-queue-manager', manager, { instantiate: false });
    app.inject('controller', 'uploadQueueManager', 'app:upload-queue-manager');
    app.inject('route',      'uploadQueueManager', 'app:upload-queue-manager');
    app.inject('app:upload-queue-manager', 'router', 'router:main');

    app.inject('component', 'uploadQueueManager', 'app:upload-queue-manager');
  }
}
