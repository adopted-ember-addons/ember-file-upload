import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, triggerEvent, TestContext } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import {
  dragAndDrop,
  dragEnter,
  dragLeave,
} from 'ember-file-upload/test-support';
import { Queue } from 'ember-file-upload';
import type { FileQueueService, UploadFile } from 'ember-file-upload';

interface LocalTestContext extends TestContext {
  queue: Queue;
  filter: (file: UploadFile) => void;
  onDragEnter: (files: File[]) => void;
  onDragLeave: (files: File[]) => void;
  onDrop: (files: UploadFile[]) => void;
}

module('Integration | Component | FileDropzone', function (hooks) {
  setupRenderingTest(hooks);

  hooks.beforeEach(function (this: LocalTestContext) {
    const fileQueueService = this.owner.lookup(
      'service:file-queue'
    ) as FileQueueService;
    this.queue = new Queue({ name: 'test', fileQueue: fileQueueService });
  });

  test('onDragEnter is called when a file is dragged over', async function (this: LocalTestContext, assert) {
    this.onDragEnter = () => assert.step('onDragEnter');

    await render(hbs`
        <FileDropzone
          class="test-dropzone"
          @queue={{this.queue}}
          @onDragEnter={{this.onDragEnter}} />
      `);

    await dragEnter('.test-dropzone');

    assert.verifySteps(['onDragEnter']);
  });

  test('filter and onDrop', async function (this: LocalTestContext, assert) {
    this.filter = (file) => file.name.includes('.txt');
    this.onDrop = (files) => files.forEach((file) => assert.step(file.name));
    await render(hbs`
        <FileDropzone
          class="test-dropzone"
          @queue={{this.queue}}
          @filter={{this.filter}}
          @onDrop={{this.onDrop}}
        />
      `);

    await dragAndDrop(
      '.test-dropzone',
      new File([], 'dingus.txt'),
      new File([], 'dangus.wmv'),
      new File([], 'dongus.txt')
    );

    assert.verifySteps(['dingus.txt', 'dongus.txt']);
  });

  test('dropping a file calls onDrop', async function (this: LocalTestContext, assert) {
    this.onDrop = (files) => files.forEach((file) => assert.step(file.name));

    await render(hbs`
        <FileDropzone
          class="test-dropzone"
          @queue={{this.queue}}
          @onDrop={{this.onDrop}} />
      `);

    await dragAndDrop('.test-dropzone', new File([], 'dingus.txt'));

    assert.verifySteps(['dingus.txt']);
  });

  test('onDragLeave is called when a file is dragged out', async function (this: LocalTestContext, assert) {
    this.onDragLeave = () => assert.step('onDragLeave');

    await render(hbs`
        <FileDropzone
          class="test-dropzone"
          @queue={{this.queue}}
          @onDragLeave={{this.onDragLeave}} />
      `);

    await dragEnter('.test-dropzone', new File([], 'dingus.txt'));
    await dragLeave('.test-dropzone', new File([], 'dingus.txt'));

    assert.verifySteps(['onDragLeave']);
  });

  test('yielded properties', async function (this: LocalTestContext, assert) {
    await render(hbs`
        {{#let (file-queue name='test') as |helperQueue|}}
          <FileDropzone @queue={{helperQueue}} as |dropzone queue|>
            <div class="supported">{{dropzone.supported}}</div>
            <div class="active">{{dropzone.active}}</div>
            <div class="queue-name">{{queue.name}}</div>
          </FileDropzone>
        {{/let}}
      `);

    assert.dom('.supported').hasText('true');
    assert.dom('.active').hasText('false');
    assert.dom('.queue-name').hasText('test');
  });

  test('dropping multiple files calls onDrop with both files', async function (this: LocalTestContext, assert) {
    this.onDrop = (files) => files.forEach((file) => assert.step(file.name));

    await render(hbs`
        <FileDropzone
          class="test-dropzone"
          @queue={{this.queue}}
          @onDrop={{this.onDrop}} />
      `);

    await dragAndDrop(
      '.test-dropzone',
      new File([], 'dingus.txt'),
      new File([], 'dingus.png')
    );

    assert.verifySteps(['dingus.txt', 'dingus.png']);
  });

  test('multiple=true dropping multiple files calls onDrop with both files', async function (this: LocalTestContext, assert) {
    this.onDrop = (files) => files.forEach((file) => assert.step(file.name));

    await render(hbs`
        <FileDropzone
          class="test-dropzone"
          @queue={{this.queue}}
          @multiple={{true}}
          @onDrop={{this.onDrop}} />
      `);

    await dragAndDrop(
      '.test-dropzone',
      new File([], 'dingus.txt'),
      new File([], 'dingus.png')
    );

    assert.verifySteps(['dingus.txt', 'dingus.png']);
  });

  test('multiple=false dropping multiple files calls onDrop with one file', async function (this: LocalTestContext, assert) {
    this.onDrop = (files) => files.forEach((file) => assert.step(file.name));

    await render(hbs`
        <FileDropzone
          class="test-dropzone"
          @queue={{this.queue}}
          @multiple={{false}}
          @onDrop={{this.onDrop}} />
      `);

    await dragAndDrop(
      '.test-dropzone',
      new File([], 'dingus.txt'),
      new File([], 'dingus.png')
    );

    assert.verifySteps(['dingus.txt']);
  });

  // Check for regression of: https://github.com/adopted-ember-addons/ember-file-upload/issues/446
  test('regression: drop events from other DOM nodes are not prevented', async function (this: LocalTestContext, assert) {
    const documentDragListener = () =>
      assert.step('documentDragListener called');
    await render(hbs`
      <FileDropzone @queue={{this.queue}} />

      <div class="independent-drag-target"></div>
    `);
    document.addEventListener('drop', documentDragListener);

    await triggerEvent('.independent-drag-target', 'drop');

    assert.verifySteps(
      ['documentDragListener called'],
      'event reached documentDragListener'
    );
  });
});
