import { find, triggerEvent } from '@ember/test-helpers';
import { assert } from '@ember/debug';

export async function upload(selector, ...files) {
  let input = find(selector);
  assert(`Selector '${selector}' is not input element.`, input.tagName === 'INPUT');
  assert(
    'All files must be instances of File/Blob type',
    files.every((file) => file instanceof Blob)
  );

  return triggerEvent(input, 'change', { files });
}

export async function dragAndDrop(selector, ...files) {
  let dropzone = find(selector);
  assert(`Selector '${dropzone}' could not be found.`, dropzone);
  assert(
    'All files must be instances of File/Blob type',
    files.every((file) => file instanceof Blob)
  );

  let dataTransfer = { files };

  await triggerEvent(dropzone, 'dragenter', { dataTransfer });
  await triggerEvent(dropzone, 'dragover', { dataTransfer });
  return triggerEvent(dropzone, 'drop', { dataTransfer });
}

export async function dragEnter(selector, ...files) {
  let dropzone = find(selector);
  assert(`Selector '${dropzone}' could not be found.`, dropzone);
  assert(
    'All files must be instances of File/Blob type',
    files.every((file) => file instanceof Blob)
  );

  let dataTransfer = { files };

  return triggerEvent(dropzone, 'dragenter', { dataTransfer });
}

export async function dragLeave(selector, ...files) {
  let dropzone = find(selector);
  assert(`Selector '${dropzone}' could not be found.`, dropzone);
  assert(
    'All files must be instances of File/Blob type',
    files.every((file) => file instanceof Blob)
  );

  let dataTransfer = { files };

  return triggerEvent(dropzone, 'dragleave', { dataTransfer });
}
