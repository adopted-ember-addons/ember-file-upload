import { find, triggerEvent } from '@ember/test-helpers';
import { assert } from '@ember/debug';

export async function upload(selector, ...files) {
  let input = find(selector);
  assert(`Selector '${selector}' is not input element.`, input.tagName === 'INPUT');
  assert(
    `All files must be instances of File/Blob type`,
    files.every((file) => file instanceof Blob)
  );

  return triggerEvent(input, 'change', { files });
}
