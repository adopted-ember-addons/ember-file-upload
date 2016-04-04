import Ember from 'ember';
import sumBy from './computed/sum-by';

const { get, set, computed } = Ember;
const { bool } = computed;

/**

  @namespace ember-file-upload
  @class Queue
  @extend Ember.ArrayProxy
 */
export default Ember.ArrayProxy.extend({

  content: [],

  init() {
    set(this, 'content', Ember.A([]));
    this._super();
  },

  destroy() {
    this._super();
    set(this, 'content', Ember.A([]));
  },

  name: null,

  uploading: bool('length'),

  size: sumBy('@each.size'),

  loaded: sumBy('@each.loaded'),

  progress: computed('size', 'loaded', {
    get() {
      let percent = (get(this, 'loaded') / get(this, 'size')) || 0;
      return Math.floor(percent * 100);
    }
  }),

  pushObject(file) {
    this._super(file);
    file.queue = this;
  }
});
