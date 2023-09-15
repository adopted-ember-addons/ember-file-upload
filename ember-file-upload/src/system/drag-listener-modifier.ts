import Modifier, { ArgsFor, NamedArgs } from 'ember-modifier';
import { DragListenerModifierSignature } from '../interfaces.ts';
import DragListener from './drag-listener.ts';
import { registerDestructor } from '@ember/destroyable';
import type Owner from '@ember/owner';

function cleanup(instance: DragListenerModifier) {
  if (!instance.listener) return;

  instance.listener.removeEventListeners();
}

export default class DragListenerModifier extends Modifier<DragListenerModifierSignature> {
  listener?: DragListener;

  constructor(owner: Owner, args: ArgsFor<DragListenerModifierSignature>) {
    super(owner, args);
    registerDestructor(this, cleanup);
  }

  modify(
    dropzone: Element,
    _: [],
    {
      dragenter,
      dragleave,
      dragover,
      drop,
    }: NamedArgs<DragListenerModifierSignature>,
  ) {
    this.listener = new DragListener(dropzone);

    this.listener.removeEventListeners();
    this.listener.addEventListeners({
      dragenter,
      dragleave,
      dragover,
      drop,
    });
  }
}
