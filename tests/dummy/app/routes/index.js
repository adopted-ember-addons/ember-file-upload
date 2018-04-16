import { A } from '@ember/array';
import Route from '@ember/routing/route';

export default Route.extend({
  model() {
    return A([{
      filename: 'little-green-men.jpg',
      preview: 'assets/images/little-green-men.jpg',
      type: 'image'
    }, {
      filename: 'samantha-mulder.jpg',
      preview: 'assets/images/samantha-mulder.jpg',
      type: 'image'
    }]);
  }
});
