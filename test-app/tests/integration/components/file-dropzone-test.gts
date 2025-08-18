import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, triggerEvent, type TestContext } from '@ember/test-helpers';
import {
  dragAndDrop,
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
    const fileQueueService = this.owner.lookup(
      'service:file-queue',
    );
    this.queue = new Queue({ name: 'test', fileQueue: fileQueueService });
  });

  test('onDragEnter is called when a file is dragged over', async function (this: LocalTestContext, assert) {
    const onDragEnter = () => assert.step('onDragEnter');
    const queue = this.queue;

    await render(<template>
      <FileDropzone
        class='test-dropzone'
        @queue={{queue}}
        @onDragEnter={{onDragEnter}}
      />
    </template>);

    await dragEnter('.test-dropzone');

    assert.verifySteps(['onDragEnter']);
  });

  test('filter and onDrop', async function (this: LocalTestContext, assert) {
    const queue = this.queue;
    const filter = (file: File) => file.name.includes('.txt');
    const onDrop = (files: UploadFile[]) =>
      files.forEach((file) => assert.step(file.name));
    await render(<template>
      <FileDropzone
        class='test-dropzone'
        @queue={{queue}}
        @filter={{filter}}
        @onDrop={{onDrop}}
      />
    </template>);

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

    await render(<template>
      <FileDropzone class='test-dropzone' @queue={{queue}} @onDrop={{onDrop}} />
    </template>);

    await dragAndDrop('.test-dropzone', new File([], 'dingus.txt'));

    assert.verifySteps(['dingus.txt']);
  });

  test('onDragLeave is called when a file is dragged out', async function (this: LocalTestContext, assert) {
    const queue = this.queue;
    const onDragLeave = () => assert.step('onDragLeave');

    await render(<template>
      <FileDropzone
        class='test-dropzone'
        @queue={{queue}}
        @onDragLeave={{onDragLeave}}
      />
    </template>);

    await dragEnter('.test-dropzone', new File([], 'dingus.txt'));
    await dragLeave('.test-dropzone', new File([], 'dingus.txt'));

    assert.verifySteps(['onDragLeave']);
  });

  test('yielded properties', async function (this: LocalTestContext, assert) {
    await render(<template>
      {{#let (fileQueue name='test') as |helperQueue|}}
        <FileDropzone @queue={{helperQueue}} as |dropzone queue|>
          <div class='supported'>{{dropzone.supported}}</div>
          <div class='active'>{{dropzone.active}}</div>
          {{! @glint-ignore }}
          <div class='queue-name'>{{queue.name}}</div>
        </FileDropzone>
      {{/let}}
    </template>);

    assert.dom('.supported').hasText('true');
    assert.dom('.active').hasText('false');
    assert.dom('.queue-name').hasText('test');
  });

  test('dropping multiple files calls onDrop with both files', async function (this: LocalTestContext, assert) {
    const queue = this.queue;
    const onDrop = (files: UploadFile[]) =>
      files.forEach((file) => assert.step(file.name));

    await render(<template>
      <FileDropzone class='test-dropzone' @queue={{queue}} @onDrop={{onDrop}} />
    </template>);

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

    await render(<template>
      <FileDropzone
        class='test-dropzone'
        @queue={{queue}}
        @multiple={{true}}
        @onDrop={{onDrop}}
      />
    </template>);

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

    await render(<template>
      <FileDropzone
        class='test-dropzone'
        @queue={{queue}}
        @multiple={{false}}
        @onDrop={{onDrop}}
      />
    </template>);

    await dragAndDrop(
      '.test-dropzone',
      new File([], 'dingus.txt'),
      new File([], 'dingus.png'),
    );

    assert.verifySteps(['dingus.txt']);
  });

  // Check for regression of: https://github.com/adopted-ember-addons/ember-file-upload/issues/446
  test('regression: drop events from other DOM nodes are not prevented', async function (this: LocalTestContext, assert) {
    const queue = this.queue;
    const documentDragListener = () =>
      assert.step('documentDragListener called');
    await render(<template>
      <FileDropzone @queue={{queue}} />

      <div class='independent-drag-target'></div>
    </template>);
    document.addEventListener('drop', documentDragListener);

    await triggerEvent('.independent-drag-target', 'drop');

    assert.verifySteps(
      ['documentDragListener called'],
      'event reached documentDragListener',
    );
  });
});
