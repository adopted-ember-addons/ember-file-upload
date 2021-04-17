import Controller from '@ember/controller';
import { setProperties, action } from '@ember/object';

export default class IndexController extends Controller {
  @action
  uploadProof(file) {
    let asset = {
      filename: file.name,
      file,
    };

    this.model.pushObject(asset);

    return file.upload('/photos/new').then(
      (response) => {
        let { filename, url, type } = response.body.data.attributes;
        setProperties(asset, {
          filename,
          preview: url,
          type,
          file: null,
        });
      },
      () => {}
    );
  }
}
