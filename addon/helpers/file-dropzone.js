import Ember from 'ember';
import Dropzone from '../system/dropzone';

export default Ember.Helper.extend({
  compute(_, hash) {
    let queue = hash.queue;
    let dropzone = queue._dropzone;

    if (!hash['for']) { return dropzone; }

    if (dropzone) {
      dropzone = Dropzone.create(hash);
    } else {
      dropzone.setProperties(hash);
    }

    return dropzone;
  },

  destroy() {
    queue._dropzone;
  }
});
