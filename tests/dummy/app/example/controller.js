import Ember from 'ember';

export default Ember.Controller.extend({
  src: 'https://example.com/image.jpg',

  actions: {
    uploadImage(file) {
      file.upload('/photos').then(({ body }) => this.set('src', body.url));
    },
  },
});
