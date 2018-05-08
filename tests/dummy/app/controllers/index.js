import Controller from '@ember/controller';
import { setProperties, get } from '@ember/object';

export default Controller.extend({
  actions: {
    uploadProof(file) {
      let asset = {
        filename: get(file, 'name'),
        file
      };

      this.model.pushObject(asset);

      return file.upload('/photos/new').then(response => {
        let { filename, url, type } = response.body.data.attributes;
        setProperties(asset, {
          filename,
          preview: url,
          type,
          file: null
        });
      }, () => {});
    }
  }
});
