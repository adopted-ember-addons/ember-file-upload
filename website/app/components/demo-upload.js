import Component from '@glimmer/component';
import { service } from '@ember/service';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { task, timeout } from 'ember-concurrency';
import { FileState } from 'ember-file-upload';

const uploadDuration = 1_500;
const steps = 15;
const stepProgress = 100 / steps;
const stepInterval = uploadDuration / steps;

const round = (number) => Math.round(number * 100) / 100;

export default class DemoUploadComponent extends Component {
  @service fileQueue;
  @tracked uploadedFiles = [];

  get queue() {
    return this.fileQueue.find('demo');
  }

  @action
  addToQueue(file) {
    file.queue = this.queue;
    file.state = FileState.Queued;
    this.uploadedFiles = [file, ...this.uploadedFiles];

    this.simulateUpload.perform(file);
  }

  estimatedTimeRemaining = (loaded, rate, size) => {
    const bytesLoaded = loaded ?? 0;
    const fileSize = size ?? 0;

    if (bytesLoaded) {
      const seconds = (fileSize - bytesLoaded) / (rate || 1);

      const date = new Date(seconds * 1000);
      const days = Math.floor(seconds / 86400);

      const daysRem = days > 0 ? `${days}d ` : '';
      const hoursRem = String(date.getUTCHours()).padStart(2, '0');
      const minutesRem = String(date.getUTCMinutes()).padStart(2, '0');
      const secondsRem = String(date.getUTCSeconds()).padStart(2, '0');

      return `${daysRem}${hoursRem}:${minutesRem}:${secondsRem}`;
    }

    return '?';
  };

  @task({ enqueue: true })
  *simulateUpload(file) {
    file.state = FileState.Uploading;

    const stepLoaded = file.size / steps;

    while (file.progress < 100) {
      yield timeout(stepInterval);
      file.loaded = file.loaded += stepLoaded;
      file.progress = round(Math.min(file.progress + stepProgress, 100));
    }

    file.state = FileState.Uploaded;
    file.queue.flush();
  }
}
