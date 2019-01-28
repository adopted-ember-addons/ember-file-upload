import { find, triggerEvent } from '@ember/test-helpers';
import { assert } from '@ember/debug';

export async function upload(selector, file) {
  let input = find(selector);
  assert(`Selector '${selector}' is not input element.`, input.tagName === 'INPUT');
  assert(`File must be instance of File/Blob type`, file instanceof Blob);

  // This hack is here since we can't mock out the
  // FileList API easily; we're taking advantage
  // that we can mutate the FileList DOM API at
  // runtime to allow us to push files into the <input>
  let files = [file];
  input.files.item = function (idx) {
    return files[idx];
  };
  input.files.size = files.length;

  return await triggerEvent(input, 'change');
}
