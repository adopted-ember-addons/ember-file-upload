import Modifier from 'ember-modifier';
import DragListener from '../system/drag-listener';

export default class DragListenerModifier extends Modifier {
  dragListener = new DragListener();

  didReceiveArguments() {
    this.dragListener.removeEventListeners(this.element);

    const { dragenter, dragleave, dragover, drop } = this.args.named;
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
