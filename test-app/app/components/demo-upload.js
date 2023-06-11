import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';

class Asset {
  @tracked filename;
  @tracked file;
  @tracked preview;
  @tracked type;

  constructor({ filename, file }) {
    this.filename = filename;
    this.file = file;
  }
}

export default class DemoUpload extends Component {
  @action
  async uploadProof(file) {
    let asset = new Asset({
      filename: file.name,
      file,
    });

    this.args.files.push(asset);

    let response;
    try {
      response = await file.upload('/photos/new');
    } catch (e) {
      return;
    }

    const json = await response.json();
    let { filename, url, type } = json.data.attributes;
    Object.assign(asset, {
      filename,
      preview: url,
      type,
      file: null,
    });
  }
}
