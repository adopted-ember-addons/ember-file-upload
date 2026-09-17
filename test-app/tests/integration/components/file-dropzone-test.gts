import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, triggerEvent, type TestContext } from '@ember/test-helpers';
import {
  dragAndDrop,
  dragAndDropDirectory,
  dragEnter,
  dragLeave,
} from 'ember-file-upload/test-support';
import { Queue } from 'ember-file-upload';
import type { UploadFile } from 'ember-file-upload';
import FileDropzone from 'ember-file-upload/components/file-dropzone';
import fileQueue from 'ember-file-upload/helpers/file-queue';

interface LocalTestContext extends TestContext {
  queue: Queue;
}

module('Integration | Component | FileDropzone', function (hooks) {
  setupRenderingTest(hooks);

  hooks.beforeEach(function (this: LocalTestContext) {
    const fileQueueService = this.owner.lookup('service:file-queue');
    this.queue = new Queue({ name: 'test', fileQueue: fileQueueService });
  });

  test('onDragEnter is called when a file is dragged over', async function (this: LocalTestContext, assert) {
    const onDragEnter = () => assert.step('onDragEnter');
    const queue = this.queue;

    await render(
      <template>
        <FileDropzone
          class="test-dropzone"
          @queue={{queue}}
          @onDragEnter={{onDragEnter}}
        />
      </template>,
    );

    await dragEnter('.test-dropzone');

    assert.verifySteps(['onDragEnter']);
  });

  test('filter and onDrop', async function (this: LocalTestContext, assert) {
    const queue = this.queue;
    const filter = (file: File) => file.name.includes('.txt');
    const onDrop = (files: UploadFile[]) =>
      files.forEach((file) => assert.step(file.name));
    await render(
      <template>
        <FileDropzone
          class="test-dropzone"
          @queue={{queue}}
          @filter={{filter}}
          @onDrop={{onDrop}}
        />
      </template>,
    );

    await dragAndDrop(
      '.test-dropzone',
      new File([], 'dingus.txt'),
      new File([], 'dangus.wmv'),
      new File([], 'dongus.txt'),
    );

    assert.verifySteps(['dingus.txt', 'dongus.txt']);
  });

  test('dropping a file calls onDrop', async function (this: LocalTestContext, assert) {
    const queue = this.queue;
    const onDrop = (files: UploadFile[]) =>
      files.forEach((file) => assert.step(file.name));

    await render(
      <template>
        <FileDropzone
          class="test-dropzone"
          @queue={{queue}}
          @onDrop={{onDrop}}
        />
      </template>,
    );

    await dragAndDrop('.test-dropzone', new File([], 'dingus.txt'));

    assert.verifySteps(['dingus.txt']);
  });

  test('onDragLeave is called when a file is dragged out', async function (this: LocalTestContext, assert) {
    const queue = this.queue;
    const onDragLeave = () => assert.step('onDragLeave');

    await render(
      <template>
        <FileDropzone
          class="test-dropzone"
          @queue={{queue}}
          @onDragLeave={{onDragLeave}}
        />
      </template>,
    );

    await dragEnter('.test-dropzone', new File([], 'dingus.txt'));
    await dragLeave('.test-dropzone', new File([], 'dingus.txt'));

    assert.verifySteps(['onDragLeave']);
  });

  test('yielded properties', async function (this: LocalTestContext, assert) {
    await render(
      <template>
        {{#let (fileQueue name="test") as |helperQueue|}}
          <FileDropzone @queue={{helperQueue}} as |dropzone queue|>
            <div class="supported">{{dropzone.supported}}</div>
            <div class="active">{{dropzone.active}}</div>
            {{! @glint-ignore }}
            <div class="queue-name">{{queue.name}}</div>
          </FileDropzone>
        {{/let}}
      </template>,
    );

    assert.dom('.supported').hasText('true');
    assert.dom('.active').hasText('false');
    assert.dom('.queue-name').hasText('test');
  });

  test('dropping multiple files calls onDrop with both files', async function (this: LocalTestContext, assert) {
    const queue = this.queue;
    const onDrop = (files: UploadFile[]) =>
      files.forEach((file) => assert.step(file.name));

    await render(
      <template>
        <FileDropzone
          class="test-dropzone"
          @queue={{queue}}
          @onDrop={{onDrop}}
        />
      </template>,
    );

    await dragAndDrop(
      '.test-dropzone',
      new File([], 'dingus.txt'),
      new File([], 'dingus.png'),
    );

    assert.verifySteps(['dingus.txt', 'dingus.png']);
  });

  test('multiple=true dropping multiple files calls onDrop with both files', async function (this: LocalTestContext, assert) {
    const queue = this.queue;
    const onDrop = (files: UploadFile[]) =>
      files.forEach((file) => assert.step(file.name));

    await render(
      <template>
        <FileDropzone
          class="test-dropzone"
          @queue={{queue}}
          @multiple={{true}}
          @onDrop={{onDrop}}
        />
      </template>,
    );

    await dragAndDrop(
      '.test-dropzone',
      new File([], 'dingus.txt'),
      new File([], 'dingus.png'),
    );

    assert.verifySteps(['dingus.txt', 'dingus.png']);
  });

  test('multiple=false dropping multiple files calls onDrop with one file', async function (this: LocalTestContext, assert) {
    const queue = this.queue;
    const onDrop = (files: UploadFile[]) =>
      files.forEach((file) => assert.step(file.name));

    await render(
      <template>
        <FileDropzone
          class="test-dropzone"
          @queue={{queue}}
          @multiple={{false}}
          @onDrop={{onDrop}}
        />
      </template>,
    );

    await dragAndDrop(
      '.test-dropzone',
      new File([], 'dingus.txt'),
      new File([], 'dingus.png'),
    );

    assert.verifySteps(['dingus.txt']);
  });

  test('allowFolderDrop=true reads nested directories and reports relative paths', async function (this: LocalTestContext, assert) {
    const queue = this.queue;
    const onDrop = (files: UploadFile[]) =>
      files.forEach((file) => assert.step(file.relativePath || file.name));

    await render(
      <template>
        <FileDropzone
          class="test-dropzone"
          @queue={{queue}}
          @allowFolderDrop={{true}}
          @onDrop={{onDrop}}
        />
      </template>,
    );

    await dragAndDropDirectory('.test-dropzone', {
      directories: [
        {
          name: 'reports',
          files: [new File([], 'summary.pdf')],
          directories: [
            {
              name: 'q3',
              files: [new File([], 'deck.pdf'), new File([], 'notes.txt')],
            },
          ],
        },
      ],
      files: [new File([], 'loose.txt')],
    });

    assert.verifySteps([
      'reports/summary.pdf',
      'reports/q3/deck.pdf',
      'reports/q3/notes.txt',
      'loose.txt',
    ]);
  });

  test('allowFolderDrop=true applies filter to files from directories, passing relative paths', async function (this: LocalTestContext, assert) {
    const queue = this.queue;
    const filter = (
      file: File,
      _files: File[],
      _index: number,
      relativePath: string,
    ) => !file.name.startsWith('.') && !relativePath.includes('__MACOSX/');
    const onDrop = (files: UploadFile[]) =>
      files.forEach((file) => assert.step(file.relativePath));

    await render(
      <template>
        <FileDropzone
          class="test-dropzone"
          @queue={{queue}}
          @allowFolderDrop={{true}}
          @filter={{filter}}
          @onDrop={{onDrop}}
        />
      </template>,
    );

    await dragAndDropDirectory('.test-dropzone', {
      directories: [
        {
          name: 'folder',
          files: [new File([], '.DS_Store'), new File([], 'photo.jpg')],
          directories: [
            { name: '__MACOSX', files: [new File([], 'meta.bin')] },
          ],
        },
      ],
    });

    assert.verifySteps(['folder/photo.jpg']);
  });

  test('allowFolderDrop=true with multiple=false adds a single file', async function (this: LocalTestContext, assert) {
    const queue = this.queue;
    const onDrop = (files: UploadFile[]) =>
      files.forEach((file) => assert.step(file.relativePath));

    await render(
      <template>
        <FileDropzone
          class="test-dropzone"
          @queue={{queue}}
          @allowFolderDrop={{true}}
          @multiple={{false}}
          @onDrop={{onDrop}}
        />
      </template>,
    );

    await dragAndDropDirectory('.test-dropzone', {
      directories: [
        {
          name: 'folder',
          files: [new File([], 'one.txt'), new File([], 'two.txt')],
        },
      ],
    });

    assert.verifySteps(['folder/one.txt']);
  });

  test('allowFolderDrop=false keeps existing drop behavior', async function (this: LocalTestContext, assert) {
    const queue = this.queue;
    const onDrop = (files: UploadFile[]) =>
      files.forEach((file) => assert.step(`${file.name}:${file.relativePath}`));

    await render(
      <template>
        <FileDropzone
          class="test-dropzone"
          @queue={{queue}}
          @onDrop={{onDrop}}
        />
      </template>,
    );

    await dragAndDrop('.test-dropzone', new File([], 'dingus.txt'));

    assert.verifySteps(['dingus.txt:']);
  });

  test('allowFolderDrop=true resets dropzone state when reading fails', async function (this: LocalTestContext, assert) {
    const queue = this.queue;
    const onDrop = (files: UploadFile[]) => assert.step(`drop:${files.length}`);

    await render(
      <template>
        <FileDropzone
          class="test-dropzone"
          @queue={{queue}}
          @allowFolderDrop={{true}}
          @onDrop={{onDrop}}
          as |dropzone|
        >
          <div class="active">{{dropzone.active}}</div>
        </FileDropzone>
      </template>,
    );

    const dataTransfer = {
      types: ['Files'],
      items: [
        {
          kind: 'file',
          webkitGetAsEntry: () => {
            throw new Error('boom');
          },
          getAsFile: () => null,
        },
      ],
    };

    await triggerEvent('.test-dropzone', 'dragenter', { dataTransfer });
    await triggerEvent('.test-dropzone', 'drop', { dataTransfer });

    assert.dom('.active').hasText('false');
    assert.verifySteps(['drop:0']);
  });

  test('allowFolderDrop=true does not reset a later drag while a slow folder read is pending', async function (this: LocalTestContext, assert) {
    const queue = this.queue;
    const onDrop = (files: UploadFile[]) =>
      files.forEach((file) => assert.step(file.relativePath || file.name));

    await render(
      <template>
        <FileDropzone
          class="test-dropzone"
          @queue={{queue}}
          @allowFolderDrop={{true}}
          @onDrop={{onDrop}}
          as |dropzone|
        >
          <div class="active">{{dropzone.active}}</div>
        </FileDropzone>
      </template>,
    );

    // A directory whose entries are only delivered once the test says so
    let deliverEntries = () => {};
    const slowDirectoryItem = {
      kind: 'file',
      getAsFile: () => null,
      webkitGetAsEntry: () => ({
        isFile: false,
        isDirectory: true,
        name: 'slow',
        fullPath: '/slow',
        createReader: () => {
          let delivered = false;
          return {
            readEntries: (callback: (entries: unknown[]) => void) => {
              if (delivered) {
                callback([]);
                return;
              }
              delivered = true;
              deliverEntries = () =>
                callback([
                  {
                    isFile: true,
                    isDirectory: false,
                    name: 'a.txt',
                    fullPath: '/slow/a.txt',
                    file: (resolve: (file: File) => void) =>
                      resolve(new File([], 'a.txt')),
                  },
                ]);
            },
          };
        },
      }),
    };
    const slowDrop = { types: ['Files'], items: [slowDirectoryItem] };
    const fastDrop = { types: ['Files'], files: [new File([], 'fast.txt')] };
    const nextTick = () => new Promise((resolve) => setTimeout(resolve, 0));

    await triggerEvent('.test-dropzone', 'dragenter', { dataTransfer: slowDrop });

    // Start the first drop without waiting for it — the folder read is
    // pending, so `settled()` (and therefore `triggerEvent`) blocks until
    // `deliverEntries` is called
    const firstDrop = triggerEvent('.test-dropzone', 'drop', {
      dataTransfer: slowDrop,
    });
    await nextTick();

    // A second drag enters while the first drop is still being read
    const secondDragEnter = triggerEvent('.test-dropzone', 'dragenter', {
      dataTransfer: fastDrop,
    });
    await nextTick();

    deliverEntries();
    await Promise.all([firstDrop, secondDragEnter]);

    assert
      .dom('.active')
      .hasText('true', 'second drag stays active after the first drop settles');

    await triggerEvent('.test-dropzone', 'drop', { dataTransfer: fastDrop });

    assert.dom('.active').hasText('false');
    assert.verifySteps(['slow/a.txt', 'fast.txt']);
  });

  // Check for regression of: https://github.com/adopted-ember-addons/ember-file-upload/issues/446
  test('regression: drop events from other DOM nodes are not prevented', async function (this: LocalTestContext, assert) {
    const queue = this.queue;
    const documentDragListener = () =>
      assert.step('documentDragListener called');
    await render(
      <template>
        <FileDropzone @queue={{queue}} />

        <div class="independent-drag-target"></div>
      </template>,
    );
    document.addEventListener('drop', documentDragListener);
    await triggerEvent('.independent-drag-target', 'drop');
    document.removeEventListener('drop', documentDragListener);

    assert.verifySteps(
      ['documentDragListener called'],
      'event reached documentDragListener',
    );
  });
});
