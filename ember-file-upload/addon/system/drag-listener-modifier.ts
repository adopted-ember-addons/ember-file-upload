import Modifier, { ArgsFor, NamedArgs } from 'ember-modifier';
import { DragListenerModifierSignature } from 'ember-file-upload/interfaces';
import DragListener from './drag-listener';
import { registerDestructor } from '@ember/destroyable';

function cleanup(instance: DragListenerModifier) {
  if (!instance.dragElement) return;

  instance.listener.removeEventListeners(instance.dragElement);
}

export default class DragListenerModifier extends Modifier<DragListenerModifierSignature> {
  listener = new DragListener();
  dragElement?: Element;

  constructor(owner: unknown, args: ArgsFor<DragListenerModifierSignature>) {
    super(owner, args);
    registerDestructor(this, cleanup);
  }

  modify(
    element: Element,
    _: [],
    {
      dragenter,
      dragleave,
      dragover,
      drop,
    }: NamedArgs<DragListenerModifierSignature>
  ) {
    this.dragElement = element;

    this.listener.removeEventListeners(element);
    this.listener.addEventListeners(element, {
      dragenter,
      dragleave,
      dragover,
      drop,
    });
  }
}
