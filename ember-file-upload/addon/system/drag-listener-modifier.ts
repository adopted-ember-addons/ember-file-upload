import Modifier from 'ember-modifier';
import { DragListenerModifierArgs } from 'ember-file-upload/interfaces';
import DragListener from './drag-listener';

export default class DragListenerModifier extends Modifier<DragListenerModifierArgs> {
  listener = new DragListener();

  didReceiveArguments() {
    const { dragenter, dragleave, dragover, drop } = this.args.named;

    this.listener.removeEventListeners(this.element);
    this.listener.addEventListeners(this.element, {
      dragenter,
      dragleave,
      dragover,
      drop,
    });
  }

  willRemove() {
    this.listener.removeEventListeners(this.element);
  }
}
