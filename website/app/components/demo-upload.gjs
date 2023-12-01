import Component from '@glimmer/component';
import { service } from '@ember/service';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { task, timeout } from 'ember-concurrency';
import { FileState } from 'ember-file-upload';
import FileDropzone from 'ember-file-upload/components/file-dropzone';
import fileQueue from 'ember-file-upload/helpers/file-queue';
import { onloadstart, onprogress, onloadend } from 'ember-file-upload/internal';
import OptionsForm, { UPLOAD_TYPES, DEFAULT_OPTIONS } from './options-form';
import { intervalToDuration, formatDuration } from 'date-fns';

// Simulated progress events every 100ms
const SIMULATED_TICK_INTERVAL = 100;
const SIMULATED_TICKS_PER_SECOND = 1_000 / SIMULATED_TICK_INTERVAL;
const BYTES_PER_KILOBYTE = 1_024;
const BITS_PER_BYTE = 8;

const round = (number) => Math.round(number);
const localeNumber = (number) => number.toLocaleString('en-GB');

export default class DemoUploadComponent extends Component {
  @service fileQueue;

  @tracked uploadOptions = DEFAULT_OPTIONS;
  @tracked files = [];

  get queue() {
    return this.fileQueue.find('demo');
  }

  get simulatedBytesPerStep() {
    const kilobytesPerSecond =
      // Convert to kilobytes
      (this.uploadOptions.rate / BITS_PER_BYTE) *
      // and then to bytes
      BYTES_PER_KILOBYTE;
    return kilobytesPerSecond / SIMULATED_TICKS_PER_SECOND;
  }

  @action
  setUploadOptions(options) {
    this.uploadOptions = options;
  }

  @action
  addToQueue(file) {
    this.files = [file, ...this.files];

    switch (this.uploadOptions.type) {
      case UPLOAD_TYPES.simulated:
        file.queue = this.queue;
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
      yield timeout(SIMULATED_TICK_INTERVAL);

      onprogress(
        file,
        new ProgressEvent('progress', {
          lengthComputable: true,
          loaded: file.loaded + this.simulatedBytesPerStep,
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

  estimatedTimeRemaining = ({ loaded, rate, size }) => {
    if (!loaded || !rate || !size) return;

    const remainingBytes = size - loaded;
    const remainingMs = remainingBytes / rate;
    const duration = intervalToDuration({ start: 0, end: remainingMs });

    return formatDuration(duration) || 'Less than a second';
  };

  <template>
    <OptionsForm
      @uploadOptions={{this.uploadOptions}}
      @onUpdate={{this.setUploadOptions}}
    />

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
          Uploading {{queue.files.length}}
          files. ({{queue.progress}}%)<br />
          Estimated time remaining:
          {{this.estimatedTimeRemaining queue}}
        {{else if dropzone.supported}}
          Or drag and drop files here to upload them
        {{/if}}
      </FileDropzone>

      <div>
        <h3>Queue</h3>
        <table>
          <thead>
            <tr>
              <th width='25%'>
                Loaded
              </th>
              <th width='25%'>
                Size
              </th>
              <th width='25%'>
                Progress
              </th>
              <th width='25%'>
                Rate
              </th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>{{localeNumber queue.loaded}} bytes</td>
              <td>{{localeNumber queue.size}} bytes</td>
              <td>{{queue.progress}}%</td>
              <td>{{localeNumber queue.rate}} bytes/ms</td>
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
              Rate
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
              <td>{{localeNumber file.rate}} bytes/ms</td>
              <td>{{round file.progress}}%</td>
            </tr>
          {{/each}}
        </tbody>
      </table>
    </div>
  </template>
}
