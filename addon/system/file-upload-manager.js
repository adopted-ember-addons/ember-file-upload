import Ember from "ember";
import FileBucket from "./file-bucket";

var get = Ember.get;
var set = Ember.set;

export default Ember.Object.extend({

  /**
    @private
    Setup a map of uploaders so they may be
    accessed by name via the `find` method.
   */
  init: function () {
    set(this, 'uploaders', Ember.Map.create());
  },

  /**
    Return or instantiate a new plupload instance
    for a file uploader.

    @method find
    @param {String} name The name of the uploader to find
    @param {Object} [config] The configuration to use for the uploader
   */
  find: function (name, component, config) {
    var uploader;

    if (get(this, 'uploaders').has(name)) {
      uploader = get(this, 'uploaders').get(name);
      if (config != null) {
        uploader.makeQueue(component, config);
      }
    } else {
      uploader = FileBucket.create({
        name: name,
        onQueued: config.on_queued,
        target: get(this, 'router')
      });
      get(this, 'uploaders').set(name, uploader);
      uploader.makeQueue(component, config);
    }
    return uploader;
  }
});
