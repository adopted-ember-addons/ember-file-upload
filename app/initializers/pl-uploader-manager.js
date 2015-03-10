import Ember from "ember";
import UploadQueueManager from "ember-plupload/system/upload-queue-manager";
import makeFileFilter from "ember-plupload/system/make-file-filter";

var keys = Ember.keys;

export function initialize(container, app) {
  app.register('app:upload-queue-manager', UploadQueueManager, { singleton: true });
  app.inject('controller', 'uploadQueueManager', 'app:upload-queue-manager');
  app.inject('route',      'uploadQueueManager', 'app:upload-queue-manager');

  app.inject('component:pl-uploader', 'uploadQueueManager', 'app:upload-queue-manager');

  var entries = requirejs.entries;
  var fileFilterPrefix = app.modulePrefix + '/file-filters';
  var fileFilters = {};
  keys(entries).forEach(function (key) {
    if (key.indexOf(fileFilterPrefix) === 0) {
      var filterName = key.split('/').slice(-1);
      var module = require(key, null, null, true);
      if (module) {
        fileFilters[filterName] = module['default'];
        makeFileFilter(filterName, module['default']);
        app.register('file-filter:' + filterName, module['default'], { instantiate: false });
      }
    }
  });

  app.register('app:file-filters', fileFilters, { instantiate: false });
  app.inject('component:pl-uploader', 'fileFilters', 'app:file-filters');
}

export default {
  name: 'pl-uploader',
  initialize: initialize
}
