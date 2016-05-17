import Ember from 'ember';
import layout from './template';

const { get } = Ember;

export default Ember.Component.extend({
  tagName: 'label',
  classNames: ['file-upload'],

  layout,

  queue: null,

  actions: {
    change(files) {
      get(this, 'queue')._addFiles(files);
    }
  }
});
