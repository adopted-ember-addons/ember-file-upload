export default function (config) {
  var removedFiles = [];
  return {
    removedFiles: removedFiles,
    settings: config || {},
    files: [],

    refresh: function () {},

    total: {
      queued: 0,
      size: 0,
      loaded: 0
    },

    init: function () {
      this.initialized = true;
    },

    addFile: function (file) {
      this.files.push(file);
      this.FilesAdded(this, [file]);
    },

    removeFile: function (file) {
      let index = this.files.indexOf(file);
      this.files.splice(index, 1);
      this.FilesRemoved(this, [file]);
      removedFiles.push(file);
    },

    bind: function (functionName, callback) {
      this[functionName] = callback;
    },

    unbindAll: function () {
      this.unbound = true;
    },

    start: function () {
      this.started = true;
    }
  };
}
