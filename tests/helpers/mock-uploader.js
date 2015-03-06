export default function (config) {
  return {
    config: config,

    total: {
      queued: 0,
      size: 0,
      loaded: 0
    },

    init: function () {
      this.initialized = true;
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
