import { modifier } from 'ember-modifier';
import { isPresent } from '@ember/utils';

const updateQueue = (_element, [queue], { multiple, disabled, onFileAdd }) => {
  if (isPresent(multiple)) queue.multiple = multiple;
  if (isPresent(disabled)) queue.disabled = disabled;
  if (isPresent(onFileAdd)) queue.onFileAdd = onFileAdd;
};

export default modifier(updateQueue);
