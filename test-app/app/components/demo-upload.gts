import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { enqueueTask } from 'ember-concurrency';
import { UploadFile } from 'ember-file-upload';
import fileQueue from 'ember-file-upload/helpers/file-queue';
import FileDropzone from 'ember-file-upload/components/file-dropzone';
import { type TrackedArray } from 'tracked-built-ins';

export interface DemoUploadSignature {
  Element: HTMLDivElement;
  Args: {
    files: TrackedArray<Asset>;
    onUploadSucceeded?: () => void;
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

interface UploadResponse {
  data: {
    attributes: {
      filename: string;
      url: string;
      type: string;
    };
  };
}

export default class DemoUpload extends Component<DemoUploadSignature> {
  uploadProof = enqueueTask(async (file: UploadFile) => {
    const asset = new Asset({
      filename: file.name,
      file,
    });

    this.args.files.push(asset);

    let response: Response;
    try {
      response = await file.upload('/photos/new');
    } catch {
      return;
    }

    const json = (await response.json()) as UploadResponse;
    const { filename, url, type } = json.data.attributes;
    Object.assign(asset, {
      filename,
      preview: url,
      type,
      file: null,
    });
  });

  <template>
    {{#let
      (fileQueue
        name="photos"
        onFileAdded=this.uploadProof.perform
        onUploadSucceeded=@onUploadSucceeded
      )
      as |queue|
    }}
      <div class="docs-my-8 text-center">
        <FileDropzone @queue={{queue}} class="demo-dropzone" as |dropzone|>
          <div
            class="dropzone-upload-area upload {{if dropzone.active 'active'}}"
          >
            {{#if dropzone.supported}}
              <div class="emoji mb-16">
                {{#if dropzone.active}}
                  ✨👽✨
                {{else}}
                  👽
                {{/if}}
              </div>
            {{/if}}

            <p>
              {{#if dropzone.supported}}
                Drag image, video or audio files here to upload.
              {{/if}}
            </p>
            <p>
              <label for="upload-photo">
                Or choose a file:
                <input
                  type="file"
                  id="upload-photo"
                  accept="image/*,video/*,audio/*"
                  multiple
                  {{queue.selectFile}}
                />
              </label>
            </p>

            {{#if queue.files.length}}
              Uploading
              {{queue.files.length}}
              files. ({{queue.progress}}%)
            {{/if}}
          </div>
        </FileDropzone>
      </div>
      <div class="my-16">
        <ul class="demo-uploaded-files-list">
          {{#each @files as |file|}}
            <li>
              <div class="card text-center">
                {{#if file.file}}
                  <div class="mb-4">{{file.file.progress}}%</div>
                {{else if file.isImage}}
                  <img src={{file.preview}} alt={{file.filename}} />
                {{else if file.isVideo}}
                  <video
                    src={{file.preview}}
                    alt={{file.filename}}
                    muted
                    loop
                    autoplay
                  >
                  </video>
                {{/if}}
                <span class="caption">{{file.filename}}</span>
              </div>
            </li>
          {{/each}}
        </ul>
      </div>
    {{/let}}
  </template>
}
