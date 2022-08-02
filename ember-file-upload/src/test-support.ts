import { find, triggerEvent } from '@ember/test-helpers';
import { assert } from '@ember/debug';

/**
  Triggers a `change` event on a `FileUpload` input with `files`.

  All `files` must be [HTML5 File objects](https://developer.mozilla.org/en-US/docs/Web/API/File).

  A single file, or multiple files may be passed as arguments.

  ```javascript
    // A single file
    const file = new File([], 'dingus.txt');
    await selectFiles('.file-upload input', file);
  ```

  ```javascript
    // Multiple files
    const file1 = new File([], 'dingus1.txt');
    const file2 = new File([], 'dingus2.txt');
    await selectFiles('.file-upload input', file1, file2);
  ```

  Returns `Promise<void>` which resolves when the application is settled.

  @function selectFiles
  @param {(String | HTMLElement)} selector DOM selector for a FileUpload input or the FileUpload input HTML Element
  @param {File} ...files One or more File objects
  @return {Promise}
 */
export async function selectFiles(
  selector: string | HTMLElement,
  ...files: (File | Blob)[]
) {
  const input = selector instanceof HTMLElement ? selector : find(selector);
  assert(
    `Selector '${selector}' is not input element.`,
    input && input.tagName === 'INPUT'
  );
  assert(
    'All files must be instances of File/Blob type',
    files.every((file) => file instanceof Blob)
  );

  return triggerEvent(input, 'change', { files });
}

/**
  Triggers `dragenter`, `dragover`, and `drop` events on a `FileDropzone` with `files`.

  All `files` must be [HTML5 File objects](https://developer.mozilla.org/en-US/docs/Web/API/File).

  A single file, or multiple files may be passed as arguments.

  ```javascript
    // A single file
    const file = new File([], 'dingus.txt');
    await dragAndDrop('.file-dropzone', file);
  ```

  ```javascript
    // Multiple files
    const file1 = new File([], 'dingus1.txt');
    const file2 = new File([], 'dingus2.txt');
    await dragAndDrop('.file-dropzone', file1, file2);
  ```

  Returns `Promise<void>` which resolves when the application is settled.

  @function dragAndDrop
  @param {(String | HTMLElement)} selector DOM selector for a FileDropzone or the FileDropzone  HTML Element
  @param {File} ...files One or more File objects
  @return {Promise}
 */
export async function dragAndDrop(
  selector: string | HTMLElement,
  ...files: (File | Blob)[]
) {
  const dropzone = selector instanceof HTMLElement ? selector : find(selector);

  assert(`Selector '${dropzone}' could not be found.`, dropzone);
  assert(
    'All files must be instances of File/Blob type',
    files.every((file) => file instanceof Blob)
  );

  const dataTransfer = { files };

  await triggerEvent(dropzone, 'dragenter', { dataTransfer });
  await triggerEvent(dropzone, 'dragover', { dataTransfer });
  return triggerEvent(dropzone, 'drop', { dataTransfer });
}

/**
  Triggers a `dragenter` event on a `FileDropzone` with `files`.

  All `files` must be [HTML5 File objects](https://developer.mozilla.org/en-US/docs/Web/API/File).

  A single file, or multiple files may be passed as arguments.

  ```javascript
    // A single file
    const file = new File([], 'dingus.txt');
    await dragEnter('.file-dropzone', file);
  ```

  ```javascript
    // Multiple files
    const file1 = new File([], 'dingus1.txt');
    const file2 = new File([], 'dingus2.txt');
    await dragEnter('.file-dropzone', file1, file2);
  ```

  Returns `Promise<void>` which resolves when the application is settled.

  @function dragEnter
  @param {(String | HTMLElement)} selector DOM selector for a FileDropzone or the FileDropzone HTML Element
  @param {File} ...files One or more File objects
  @return {Promise}
 */
export async function dragEnter(
  selector: string | HTMLElement,
  ...files: (File | Blob)[]
) {
  const dropzone = selector instanceof HTMLElement ? selector : find(selector);

  assert(`Selector '${dropzone}' could not be found.`, dropzone);
  assert(
    'All files must be instances of File/Blob type',
    files.every((file) => file instanceof Blob)
  );

  const dataTransfer = { files };

  return triggerEvent(dropzone, 'dragenter', { dataTransfer });
}

/**
  Triggers a `dragleave` event on a `FileDropzone` with `files`.

  All `files` must be [HTML5 File objects](https://developer.mozilla.org/en-US/docs/Web/API/File).

  A single file, or multiple files may be passed as arguments.

  ```javascript
    // A single file
    const file = new File([], 'dingus.txt');
    await dragLeave('.file-dropzone', file);
  ```

  ```javascript
    // Multiple files
    const file1 = new File([], 'dingus1.txt');
    const file2 = new File([], 'dingus2.txt');
    await dragLeave('.file-dropzone', file1, file2);
  ```

  Returns `Promise<void>` which resolves when the application is settled.

  @function dragLeave
  @param {(String | HTMLElement)} selector DOM selector for a FileDropzone or the FileDropzone HTML Element
  @param {File} ...files One or more File objects
  @return {Promise}
 */
export async function dragLeave(
  selector: string | HTMLElement,
  ...files: (File | Blob)[]
) {
  const dropzone = selector instanceof HTMLElement ? selector : find(selector);

  assert(`Selector '${dropzone}' could not be found.`, dropzone);
  assert(
    'All files must be instances of File/Blob type',
    files.every((file) => file instanceof Blob)
  );

  const dataTransfer = { files };

  return triggerEvent(dropzone, 'dragleave', { dataTransfer });
}
