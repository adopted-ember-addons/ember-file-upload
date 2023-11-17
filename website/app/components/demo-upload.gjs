import Component from '@glimmer/component';
import { service } from '@ember/service';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { task, timeout } from 'ember-concurrency';
import { FileState } from 'ember-file-upload';
import FileDropzone from 'ember-file-upload/components/file-dropzone';
import fileQueue from 'ember-file-upload/helpers/file-queue';
import { onloadstart, onprogress, onloadend } from 'ember-file-upload/internal';
import { on } from '@ember/modifier';
import { htmlSafe } from '@ember/template';

const UPLOAD_TYPES = {
  simulated: 'Simulated 🧑‍🔬',
  http: 'HTTP 📡',
};

// Values in kilobits per second (kbps)
const UPLOAD_RATES = {
  'Disconnected - 0 Mbps': 0,
  'Very slow - 0.1 Mbps': 100,
  'Slow 3G - 0.4 Mbps': 400,
  'Fast 3G - 0.675 Mbps': 675,
  'ADSL - 1.5 Mbps': 1_500,
  '4G/LTE - 50 Mbps': 50_000,
  'Fast Fibre - 100 Mbps': 100_000,
};
const DEFAULT_RATE = UPLOAD_RATES['Fast 3G - 0.675 Mbps'];
const DEFAULT_URL = 'https://api.bytescale.com/v1/files/basic';
const DEFAULT_HEADERS = {
  Authorization: 'Basic YXBpa2V5OmZyZWU',
  'Content-Type': 'application/x-www-form-urlencoded',
};
const DEFAULT_METHOD = 'POST';

const STEP_INTERVAL = 100; // Progress events every 100ms
const STEPS_PER_SECOND = 1_000 / STEP_INTERVAL;
const BYTES_PER_KILOBYTE = 1_024;
const BITS_PER_BYTE = 8;

const round = (number) => Math.round(number);
const localeNumber = (number) => number.toLocaleString('en-GB');
const eq = (a, b) => a === b;

export default class DemoUploadComponent extends Component {
  @service fileQueue;

  @tracked files = [];

  @tracked uploadOptions = {
    type: UPLOAD_TYPES.simulated,
    rate: DEFAULT_RATE,
    url: DEFAULT_URL,
    method: DEFAULT_METHOD,
    headers: DEFAULT_HEADERS,
  };

  get queue() {
    return this.fileQueue.find('demo');
  }

  get bytesPerStep() {
    const kilobytesPerSecond =
      // Convert to kilobytes
      (this.uploadOptions.rate / BITS_PER_BYTE) *
      // and then to bytes
      BYTES_PER_KILOBYTE;
    return kilobytesPerSecond / STEPS_PER_SECOND;
  }

  @action
  setUploadOptions(event) {
    const formData = new FormData(event.currentTarget);
    const entries = Object.fromEntries(formData.entries());
    this.uploadOptions = {
      ...entries,
      rate: parseInt(entries.rate, 10),
      headers: JSON.parse(entries.headers),
    };
  }

  @action
  addToQueue(file) {
    this.files = [file, ...this.files];

    switch (this.uploadOptions.type) {
      case UPLOAD_TYPES.simulated:
        file.queue = this.queue;
        file.state = FileState.Queued;
        this.simulateUpload.perform(file);
        break;
      case UPLOAD_TYPES.http:
        this.httpUpload.perform(file);
        break;
    }
  }

  @task({ enqueue: true })
  *simulateUpload(file) {
    file.state = FileState.Uploading;

    onloadstart(
      file,
      new ProgressEvent('loadstart', {
        lengthComputable: true,
        loaded: 0,
        total: 0,
      }),
    );

    while (file.progress < 100) {
      yield timeout(STEP_INTERVAL);

      onprogress(
        file,
        new ProgressEvent('progress', {
          lengthComputable: true,
          loaded: file.loaded + this.bytesPerStep,
          total: file.size,
        }),
      );
    }

    onloadend(
      file,
      new ProgressEvent('loadend', {
        lengthComputable: true,
        loaded: file.size,
        total: file.size,
      }),
    );

    file.state = FileState.Uploaded;
    file.queue.flush();
  }

  @task({ enqueue: true })
  *httpUpload(file) {
    yield file.upload(this.uploadOptions.url, {
      method: this.uploadOptions.method,
      headers: this.uploadOptions.headers,
    });
  }

  toggleVisibility = (type) => {
    return this.uploadOptions.type === type
      ? htmlSafe('')
      : htmlSafe('display: none');
  };

  <template>
    {{log this.uploadOptions}}
    <form aria-label='Upload options' {{on 'change' this.setUploadOptions}}>
      <fieldset>
        <legend>Upload type:</legend>
        <label>
          {{#each-in UPLOAD_TYPES as |_key type|}}
            <div>
              <input
                type='radio'
                name='type'
                id={{type}}
                value={{type}}
                checked={{eq this.uploadOptions.type type}}
              />
              <label for={{type}}>{{type}}</label>
            </div>
          {{/each-in}}
        </label>
      </fieldset>

      <label style={{this.toggleVisibility UPLOAD_TYPES.simulated}}>
        Simulated speed:
        <select name='rate'>
          {{#each-in UPLOAD_RATES as |name rate|}}
            <option value={{rate}} selected={{eq this.uploadOptions.rate rate}}>
              {{name}}
            </option>
          {{/each-in}}
        </select>
      </label>

      <label style={{this.toggleVisibility UPLOAD_TYPES.http}}>
        URL:
        <input type='text' name='url' value={{DEFAULT_URL}} />
      </label>

      <label style={{this.toggleVisibility UPLOAD_TYPES.http}}>
        Method:
        <input type='text' name='method' value={{DEFAULT_METHOD}} />
      </label>

      <label style={{this.toggleVisibility UPLOAD_TYPES.http}}>
        Headers:
        <textarea name='headers' rows='5' spellcheck='false'>{{JSON.stringify DEFAULT_HEADERS null 2}}</textarea>
      </label>
    </form>

    {{#let (fileQueue name='demo' onFileAdded=this.addToQueue) as |queue|}}
      <FileDropzone
        @queue={{queue}}
        class='demo-upload__dropzone'
        as |dropzone|
      >
        <form aria-label='File upload'>
          <label>
            <input type='file' {{queue.selectFile}} />
          </label>
        </form>
        {{#if dropzone.active}}
          Drop to upload
        {{else if queue.files.length}}
          Uploading
          {{queue.files.length}}
          files. ({{queue.progress}}%)
        {{else if dropzone.supported}}
          Or drag and drop files here to upload them
        {{/if}}
      </FileDropzone>

      <div>
        <h3>Queue</h3>
        <table>
          <thead>
            <tr>
              <th width='33%'>
                Loaded
              </th>
              <th width='33%'>
                Size
              </th>
              <th width='33%'>
                Progress
              </th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>{{localeNumber queue.loaded}} bytes</td>
              <td>{{localeNumber queue.size}} bytes</td>
              <td>{{queue.progress}}%</td>
            </tr>
          </tbody>
        </table>
      </div>
    {{/let}}

    <div>
      <h3>Files</h3>
      <table>
        <thead>
          <tr>
            <th>
              Name
            </th>
            <th>
              Type
            </th>
            <th>
              Size
            </th>
            <th>
              Source
            </th>
            <th>
              State
            </th>
            <th>
              Progress
            </th>
          </tr>
        </thead>
        <tbody>
          {{#each this.files as |file|}}
            <tr>
              <td>{{file.name}}</td>
              <td>{{file.type}}</td>
              <td>{{localeNumber file.size}} bytes</td>
              <td>{{file.source}}</td>
              <td>{{file.state}}</td>
              <td>{{round file.progress}}</td>
            </tr>
          {{/each}}
        </tbody>
      </table>
    </div>
  </template>
}
