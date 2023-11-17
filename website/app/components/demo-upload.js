import Component from '@glimmer/component';
import { service } from '@ember/service';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { task, timeout } from 'ember-concurrency';
import { FileState } from 'ember-file-upload';
import { onloadstart, onprogress, onloadend } from 'ember-file-upload/internal';

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

export default class DemoUploadComponent extends Component {
  @service fileQueue;

  @tracked files = [];
  @tracked uploadRate = UPLOAD_RATES['Fast 3G - 0.675 Mbps'];

  UPLOAD_RATES = UPLOAD_RATES;

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

  round = (number) => Math.round(number);
  localeNumber = (number) => number.toLocaleString('en-GB');
  eq = (a, b) => a === b;

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
}
