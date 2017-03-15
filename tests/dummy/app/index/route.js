import Ember from 'ember';

const { get, setProperties } = Ember;

export default Ember.Route.extend({
  model() {
    return Ember.A([{
      filename: 'little-green-men.jpg',
      preview: '/assets/images/little-green-men.jpg',
      type: 'image'
    }, {
      filename: 'samantha-mulder.jpg',
      preview: '/assets/images/samantha-mulder.jpg',
      type: 'image'
    }]);
  },

  actions: {
    uploadProof (file) {
      let asset = {
        filename: get(file, 'name'),
        file
      };
      this.currentModel.pushObject(asset);
      return file.upload('/photos/new').then(({ body: { filename, url, type } }) => {
        setProperties(asset, {
          filename,
          preview: url,
          type,
          file: null
        });
      }, function () {});
    }
  }
});
