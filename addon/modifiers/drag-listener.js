import Modifier from 'ember-modifier';
import DragListener from '../system/drag-listener';

export default class DragListenerModifier extends Modifier {
  dragListener = new DragListener();

  didReceiveArguments() {
    const { dragenter, dragleave, dragover, drop } = this.args.named;

    this.dragListener.removeEventListeners(this.element);
    this.dragListener.addEventListeners(this.element, {
      dragenter,
      dragleave,
      dragover,
      drop,
    });
  }

  willRemove() {
    this.dragListener.removeEventListeners(this.element);
  }
}
