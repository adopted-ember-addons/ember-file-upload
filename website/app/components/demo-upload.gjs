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
  @tracked uploadRate = UPLOAD_RATES['Fast 3G - 0.675 Mbps'];

  get queue() {
    return this.fileQueue.find('demo');
  }

  get bytesPerStep() {
    const kilobytesPerSecond =
      // Convert to kilobytes
      (this.uploadRate / BITS_PER_BYTE) *
      // and then to bytes
      BYTES_PER_KILOBYTE;
    return kilobytesPerSecond / STEPS_PER_SECOND;
  }

  @action
  setUploadRate(event) {
    this.uploadRate = parseInt(event.target.value, 10);
  }

  @action
  addToQueue(file) {
    file.queue = this.queue;
    file.state = FileState.Queued;
    this.files = [file, ...this.files];

    this.simulateUpload.perform(file);
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

  <template>
    <form aria-label='Simulate upload speed'>
      <label>
        Simulate upload speed:
        <select name='uploadRate' {{on 'change' this.setUploadRate}}>
          {{#each-in UPLOAD_RATES as |name rate|}}
            <option value={{rate}} selected={{eq this.uploadRate rate}}>
              {{name}}
            </option>
          {{/each-in}}
        </select>
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
