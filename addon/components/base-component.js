import Component from '@glimmer/component';
import { inject as service } from '@ember/service';

export default class BaseComponent extends Component {
  @service fileQueue;

  constructor(owner, args) {
    super(owner, args);
    if (!this.queue) return;

    const { accept, multiple, disabled, onFileAdd } = this.args;
    this.queue.accept = accept;
    this.queue.multiple = multiple;
    this.queue.disabled = disabled;
    this.queue.onFileAdd = onFileAdd;
  }

  get queue() {
    if (!this.args.name) return null;

    return (
      this.fileQueue.find(this.args.name) ||
      this.fileQueue.create(this.args.name)
    );
  }
}
