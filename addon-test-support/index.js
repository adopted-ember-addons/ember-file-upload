import { find, triggerEvent } from '@ember/test-helpers';
import { assert } from '@ember/debug';

export async function upload(selector, file) {
  let input = find(selector);
  assert(`Selector '${selector}' is not input element.`, input.tagName === 'INPUT');
  assert(`File must be instance of File/Blob type`, file instanceof Blob);

  return await triggerEvent(input, 'change', { files: [file] });
}
