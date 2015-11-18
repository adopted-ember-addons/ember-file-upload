import Ember from 'ember';
import UploadQueue from '../system/upload-queue';
import flatten from '../system/flatten';

var get = Ember.get;
var set = Ember.set;
var computed = Ember.computed;

export default Ember.Service.extend({

  /**
    @private
    Setup a map of uploaders so they may be
    accessed by name via the `find` method.
   */
  init() {
    set(this, 'queues', Ember.Map.create());
    set(this, 'all', Ember.A());
  },

  files: computed('all.@each.length', {
    get() {
      return flatten(get(this, 'all').invoke('toArray'));
    }
  }),

  size: computed('all.@each.size', {
    get() {
      return Ember.A(get(this, 'all').getEach('size')).reduce(function (E, x) {
        return E + x;
      }, 0);
    }
  }),

  loaded: computed('all.@each.loaded', {
    get() {
      return Ember.A(get(this, 'all').getEach('loaded')).reduce(function (E, x) {
        return E + x;
      }, 0);
    }
  }),

  progress: Ember.computed('size', 'loaded', function () {
    let percent = get(this, 'loaded') / get(this, 'size') || 0;
    return Math.floor(percent * 100);
  }),

  /**
    Return or instantiate a new plupload instance
    for an upload queue.

    @method find
    @param {String} name The name of the queue to find
    @param {Object} [config] The configuration to use for the uploader
   */
  findOrCreate(name, component, config) {
    var queue;

    if (get(this, 'queues').has(name)) {
      queue = get(this, 'queues').get(name);
      if (config != null) {
        set(queue, 'target', component);
        queue.configure(config);
      }
    } else {
      queue = UploadQueue.create({
        name: name,
        target: component
      });
      get(this, 'all').pushObject(queue);
      get(this, 'queues').set(name, queue);
      queue.configure(config);
    }
    return queue;
  }
});
