import Controller from '@ember/controller';
import { get, computed } from '@ember/object';

export default Controller.extend({
  ships: computed('model.[]', {
    get() {
      return get(this, 'model').slice(-5);
    }
  })
});
