import Ember from 'ember';
import Dropzone from '../system/dropzone';

export default Ember.Helper.extend({
  compute(_, hash) {
    let dropzone = this._dropzone;

    if (!hash['for']) { return dropzone; }

    if (dropzone) {
      dropzone.setProperties(hash);
    } else {
      dropzone = this._dropzone = Dropzone.create(Ember.merge({
        queue: hash.queue,
        recompute: () => this.recompute()
      }, hash));
    }

    return dropzone;
  },

  destroy() {
    this._dropzone.destroy();
    this._dropzone = null;
  }
});
