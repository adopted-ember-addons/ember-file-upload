import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { UploadFile } from 'ember-file-upload';
import { type TrackedArray } from 'tracked-built-ins';

export interface DemoUploadSignature {
  Element: HTMLDivElement;
  Args: {
    files: TrackedArray<Asset>;
  };
  Blocks: Record<string, never>;
}

export class Asset {
  @tracked filename;
  @tracked file;
  @tracked preview?: string;
  @tracked type?: string;

  constructor({ filename, file }: { filename: string; file: UploadFile }) {
    this.filename = filename;
    this.file = file;
  }

  get isImage() {
    return this.type === 'image';
  }

  get isVideo() {
    return this.type === 'video';
  }
}

export default class DemoUpload extends Component<DemoUploadSignature> {
  @action
  async uploadProof(file: UploadFile) {
    const asset = new Asset({
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
    const { filename, url, type } = json.data.attributes;
    Object.assign(asset, {
      filename,
      preview: url,
      type,
      file: null,
    });
  }
}
