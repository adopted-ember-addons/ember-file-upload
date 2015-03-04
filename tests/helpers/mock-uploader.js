export default function () {
  return {
    total: {
      queued: 0,
      size: 0,
      loaded: 0
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
