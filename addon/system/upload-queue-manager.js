import Ember from "ember";
import UploadQueue from "./upload-queue";

var get = Ember.get;
var set = Ember.set;

export default Ember.Object.extend({

  /**
    @private
    Setup a map of uploaders so they may be
    accessed by name via the `find` method.
   */
  init: function () {
    set(this, 'queues', Ember.Map.create());
  },

  /**
    Return or instantiate a new plupload instance
    for an upload queue.

    @method find
    @param {String} name The name of the queue to find
    @param {Object} [config] The configuration to use for the uploader
   */
  find: function (name, component, config) {
    var queue;

    if (get(this, 'queues').has(name)) {
      queue = get(this, 'queues').get(name);
      if (config != null) {
        queue.configure(config);
      }
    } else {
      queue = UploadQueue.create({
        name: name,
        target: component
      });
      get(this, 'queues').set(name, queue);
      queue.configure(config);
    }
    return queue;
  }
});
