import Ember from 'ember';
import sumBy from './computed/sum-by';

const { get, set, computed } = Ember;
const { bool } = computed;

/**
  The Queue is a collection of files that
  are being manipulated by the user.

  Queues are designed to persist the state
  of uploads when a user navigates around your
  application.

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

  pushObject(file) {
    this._super(file);
    file.queue = this;
  },

  /**
    The unique identifier of the queue.

    Queue names should be deterministic so they
    can be retrieved. It's recommended to provide
    a helpful name.

    If the queue belongs to a top level collection,
    photos, the good name for this queue may be `"photos"`.

    If you're uploading images to an artwork, the
    best name would incoporate both `"artworks"` and
    the identifier of the artwork. A good name for this
    queue may be `"artworks/{{id}}/photos"`, where `{{id}}`
    is a dynamic segment that is generated from the artwork id.

    @property name
    @type {String}
    @default null
   */
  name: null,

  /**
    The aggregate size (in bytes) of all files in the queue.

    @property size
    @readonly
    @type {Number}
    @default 0
   */
  size: sumBy('@each.size'),

  /**
    The aggregate amount of bytes that have been uploaded
    to the server for all files in the queue.

    @property loaded
    @readonly
    @type {Number}
    @default 0
   */
  loaded: sumBy('@each.loaded'),

  /**
    The current upload progress of the queue, as a number from 0 to 100.

    @property progress
    @readonly
    @type {Number}
    @default 0
   */
  progress: computed('size', 'loaded', {
    get() {
      let percent = (get(this, 'loaded') / get(this, 'size')) || 0;
      return Math.floor(percent * 100);
    }
  })
});
