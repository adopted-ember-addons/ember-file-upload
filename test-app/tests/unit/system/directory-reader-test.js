import { readDataTransferItems } from 'ember-file-upload/internal';
import { module, test } from 'qunit';

function fileEntry(file, parentPath, { unreadable = false } = {}) {
  return {
    isFile: true,
    isDirectory: false,
    name: file.name,
    fullPath: `${parentPath}/${file.name}`,
    file: (successCallback, errorCallback) => {
      if (unreadable) {
        errorCallback(new Error('read failed'));
      } else {
        successCallback(file);
      }
    },
  };
}

function directoryEntry(name, parentPath, children, { chunkSize = 2 } = {}) {
  const fullPath = `${parentPath}/${name}`;
  return {
    isFile: false,
    isDirectory: true,
    name,
    fullPath,
    createReader() {
      const entries = children.map((child) =>
        typeof child === 'function' ? child(fullPath) : child,
      );
      let index = 0;
      return {
        readEntries: (successCallback) => {
          const chunk = entries.slice(index, index + chunkSize);
          index += chunk.length;
          successCallback(chunk);
        },
      };
    },
  };
}

function directoryItem(entry) {
  return {
    kind: 'file',
    webkitGetAsEntry: () => entry,
    getAsFile: () => null,
  };
}

function fileItem(file) {
  return {
    kind: 'file',
    webkitGetAsEntry: () => fileEntry(file, ''),
    getAsFile: () => file,
  };
}

module('Unit | readDataTransferItems', function () {
  test('reads a nested directory tree with relative paths', async function (assert) {
    const root = directoryEntry('reports', '', [
      (path) => fileEntry(new File([], 'summary.pdf'), path),
      (path) =>
        directoryEntry('q3', path, [
          (subPath) => fileEntry(new File([], 'deck.pdf'), subPath),
          (subPath) =>
            directoryEntry('drafts', subPath, [
              (draftPath) => fileEntry(new File([], 'notes.txt'), draftPath),
            ]),
        ]),
    ]);

    const files = await readDataTransferItems([directoryItem(root)]);

    assert.deepEqual(files.map(({ relativePath }) => relativePath).sort(), [
      'reports/q3/deck.pdf',
      'reports/q3/drafts/notes.txt',
      'reports/summary.pdf',
    ]);
  });

  test('reads directories larger than one readEntries chunk', async function (assert) {
    const manyFiles = Array.from(
      { length: 7 },
      (_, index) => new File([], `file-${index}.txt`),
    );
    const root = directoryEntry(
      'big',
      '',
      manyFiles.map((file) => (path) => fileEntry(file, path)),
      { chunkSize: 2 },
    );

    const files = await readDataTransferItems([directoryItem(root)]);

    assert.strictEqual(files.length, 7);
  });

  test('handles a mix of directories and loose files', async function (assert) {
    const root = directoryEntry('folder', '', [
      (path) => fileEntry(new File([], 'inside.txt'), path),
    ]);

    const files = await readDataTransferItems([
      directoryItem(root),
      fileItem(new File([], 'loose.txt')),
    ]);

    assert.deepEqual(
      files.map(({ file, relativePath }) => ({
        name: file.name,
        relativePath,
      })),
      [
        { name: 'inside.txt', relativePath: 'folder/inside.txt' },
        { name: 'loose.txt', relativePath: '' },
      ],
    );
  });

  test('skips unreadable files without failing the drop', async function (assert) {
    const root = directoryEntry('folder', '', [
      (path) => fileEntry(new File([], 'good.txt'), path),
      (path) => fileEntry(new File([], 'bad.txt'), path, { unreadable: true }),
      (path) => fileEntry(new File([], 'also-good.txt'), path),
    ]);

    const files = await readDataTransferItems([directoryItem(root)]);

    assert.deepEqual(files.map(({ file }) => file.name).sort(), [
      'also-good.txt',
      'good.txt',
    ]);
  });

  test('skips unreadable directories without failing the drop', async function (assert) {
    const root = directoryEntry('folder', '', [
      (path) => fileEntry(new File([], 'good.txt'), path),
      (path) => ({
        isFile: false,
        isDirectory: true,
        name: 'locked',
        fullPath: `${path}/locked`,
        createReader: () => ({
          readEntries: (_successCallback, errorCallback) => {
            errorCallback(new Error('permission denied'));
          },
        }),
      }),
    ]);

    const files = await readDataTransferItems([directoryItem(root)]);

    assert.deepEqual(
      files.map(({ file }) => file.name),
      ['good.txt'],
    );
  });

  test('ignores non-file items', async function (assert) {
    const stringItem = {
      kind: 'string',
      webkitGetAsEntry: () => null,
      getAsFile: () => null,
    };

    const files = await readDataTransferItems([
      stringItem,
      fileItem(new File([], 'file.txt')),
    ]);

    assert.deepEqual(
      files.map(({ file }) => file.name),
      ['file.txt'],
    );
  });

  test('returns an empty result for an empty directory', async function (assert) {
    const root = directoryEntry('empty', '', []);

    const files = await readDataTransferItems([directoryItem(root)]);

    assert.deepEqual(files, []);
  });
});
