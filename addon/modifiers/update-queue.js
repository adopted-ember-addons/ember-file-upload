import { modifier } from 'ember-modifier';
import { isPresent } from '@ember/utils';

const updateQueue = (
  _element,
  [queue],
  { accept, multiple, disabled, onFileAdd }
) => {
  if (isPresent(accept)) queue.accept = accept;
  if (isPresent(multiple)) queue.multiple = multiple;
  if (isPresent(disabled)) queue.disabled = disabled;
  if (isPresent(onFileAdd)) queue.onFileAdd = onFileAdd;
};

export default modifier(updateQueue);
