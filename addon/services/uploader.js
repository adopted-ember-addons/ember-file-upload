import Ember from 'ember';
import Queue from '../queue';
import flatten from '../system/flatten';
import sumBy from '../computed/sum-by';

const { get, set, computed } = Ember;

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

  size: sumBy('files.@each.size'),

  loaded: sumBy('files.@each.loaded'),

  progress: computed('size', 'loaded', {
    get() {
      let percent = get(this, 'loaded') / get(this, 'size') || 0;
      return Math.floor(percent * 100);
    }
  }),

  /**
    Return or instantiate a queue.

    @method find
    @param {String} name The name of the queue to find
    @param {Object} options The options to set on the queue
   */
  findOrCreate(name, options={}) {
    var queue;

    if (get(this, 'queues').has(name)) {
      queue = get(this, 'queues').get(name);
    } else {
      queue = Queue.create({ name });
      get(this, 'all').pushObject(queue);
      get(this, 'queues').set(name, queue);
    }
    queue.setProperties(options);

    return queue;
  }
});
