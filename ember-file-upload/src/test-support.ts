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
  @param {string | HTMLElement} target The element or selector representing a file input
  @param {File} ...files One or more File objects
  @return {Promise}
 */
export async function selectFiles(
  target: string | HTMLElement,
  ...files: (File | Blob)[]
) {
  const input = target instanceof HTMLElement ? target : find(target);
  assert(
    `Target '${target}' is not an input element.`,
    input && input.tagName === 'INPUT',
  );
  assert(
    'All files must be instances of File/Blob type',
    files.every((file) => file instanceof Blob),
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
  @param {string | HTMLElement} target The element or selector representing a FileDropzone
  @param {File} ...files One or more File objects
  @return {Promise}
 */
export async function dragAndDrop(
  target: string | HTMLElement,
  ...files: (File | Blob)[]
) {
  const dropzone = target instanceof HTMLElement ? target : find(target);

  assert(`Target '${dropzone}' could not be found.`, dropzone);
  assert(
    'All files must be instances of File/Blob type',
    files.every((file) => file instanceof Blob),
  );

  const dataTransfer = { files };

  await triggerEvent(dropzone, 'dragenter', { dataTransfer });
  await triggerEvent(dropzone, 'dragover', { dataTransfer });
  return triggerEvent(dropzone, 'drop', { dataTransfer });
}

/**
  A directory to simulate dropping onto a `FileDropzone` with
  `dragAndDropDirectory`. Directories may be nested arbitrarily deep.
 */
export interface DirectoryStub {
  name: string;
  files?: File[];
  directories?: DirectoryStub[];
}

interface FileSystemEntryStub {
  isFile: boolean;
  isDirectory: boolean;
  name: string;
  fullPath: string;
  file?: (
    successCallback: (file: File) => void,
    errorCallback?: (error: Error) => void,
  ) => void;
  createReader?: () => {
    readEntries: (
      successCallback: (entries: FileSystemEntryStub[]) => void,
      errorCallback?: (error: Error) => void,
    ) => void;
  };
}

// Emulate Chromium's chunked reads (it returns at most 100 entries per
// `readEntries` call). A small chunk size exercises the chunking loop.
const READ_ENTRIES_CHUNK_SIZE = 2;

function fileEntryStub(file: File, parentPath: string): FileSystemEntryStub {
  return {
    isFile: true,
    isDirectory: false,
    name: file.name,
    fullPath: `${parentPath}/${file.name}`,
    file: (successCallback) => successCallback(file),
  };
}

function directoryEntryStub(
  directory: DirectoryStub,
  parentPath: string,
): FileSystemEntryStub {
  const fullPath = `${parentPath}/${directory.name}`;
  const children = [
    ...(directory.files ?? []).map((file) => fileEntryStub(file, fullPath)),
    ...(directory.directories ?? []).map((subdirectory) =>
      directoryEntryStub(subdirectory, fullPath),
    ),
  ];

  return {
    isFile: false,
    isDirectory: true,
    name: directory.name,
    fullPath,
    createReader: () => {
      let index = 0;
      return {
        readEntries: (successCallback) => {
          const chunk = children.slice(index, index + READ_ENTRIES_CHUNK_SIZE);
          index += chunk.length;
          successCallback(chunk);
        },
      };
    },
  };
}

/**
  Triggers `dragenter`, `dragover`, and `drop` events on a `FileDropzone`
  with one or more directories, simulating a folder drop.

  Only has an effect when the dropzone has `@allowFolderDrop={{true}}`.

  ```javascript
    await dragAndDropDirectory('.file-dropzone', {
      directories: [
        {
          name: 'reports',
          files: [new File([], 'summary.pdf')],
          directories: [
            { name: 'q3', files: [new File([], 'deck.pdf')] },
          ],
        },
      ],
      // loose files dropped alongside the directory
      files: [new File([], 'notes.txt')],
    });
  ```

  Returns `Promise<void>` which resolves when the application is settled.

  @function dragAndDropDirectory
  @param {string | HTMLElement} target The element or selector representing a FileDropzone
  @param {Object} options `directories` to drop and optional loose `files`
  @return {Promise}
 */
export async function dragAndDropDirectory(
  target: string | HTMLElement,
  options: { directories: DirectoryStub[]; files?: File[] },
) {
  const dropzone = target instanceof HTMLElement ? target : find(target);

  assert(`Target '${dropzone}' could not be found.`, dropzone);
  assert(
    'options.directories must be an array',
    options.directories instanceof Array,
  );
  assert(
    'All loose files must be instances of File type',
    (options.files ?? []).every((file) => file instanceof File),
  );

  const directoryItems = options.directories.map((directory) => ({
    kind: 'file',
    webkitGetAsEntry: () => directoryEntryStub(directory, ''),
    getAsFile: () => null,
  }));

  const fileItems = (options.files ?? []).map((file) => ({
    kind: 'file',
    webkitGetAsEntry: () => fileEntryStub(file, ''),
    getAsFile: () => file,
  }));

  const dataTransfer = {
    types: ['Files'],
    items: [...directoryItems, ...fileItems],
  };

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
  @param {string | HTMLElement} target The element or selector representing a FileDropzone
  @param {File} ...files One or more File objects
  @return {Promise}
 */
export async function dragEnter(
  target: string | HTMLElement,
  ...files: (File | Blob)[]
) {
  const dropzone = target instanceof HTMLElement ? target : find(target);

  assert(`Target '${dropzone}' could not be found.`, dropzone);
  assert(
    'All files must be instances of File/Blob type',
    files.every((file) => file instanceof Blob),
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
  @param {string | HTMLElement} target The element or selector representing a FileDropzone
  @param {File} ...files One or more File objects
  @return {Promise}
 */
export async function dragLeave(
  target: string | HTMLElement,
  ...files: (File | Blob)[]
) {
  const dropzone = target instanceof HTMLElement ? target : find(target);

  assert(`Target '${dropzone}' could not be found.`, dropzone);
  assert(
    'All files must be instances of File/Blob type',
    files.every((file) => file instanceof Blob),
  );

  const dataTransfer = { files };

  return triggerEvent(dropzone, 'dragleave', { dataTransfer });
}
