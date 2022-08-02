import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, triggerEvent } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import {
  dragAndDrop,
  dragAndDropDirectory,
  dragEnter,
  dragLeave,
} from 'ember-file-upload/test-support';
import { Queue } from 'ember-file-upload';

module('Integration | Component | FileDropzone', function (hooks) {
  setupRenderingTest(hooks);

  hooks.beforeEach(function () {
    const fileQueueService = this.owner.lookup('service:file-queue');
    this.queue = new Queue({ name: 'test', fileQueue: fileQueueService });
  });

  test('onDragEnter is called when a file is dragged over', async function (assert) {
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

  test('filter and onDrop', async function (assert) {
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

  test('dropping a file calls onDrop', async function (assert) {
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

  test('onDragLeave is called when a file is dragged out', async function (assert) {
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

  test('yielded properties', async function (assert) {
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

  test('dropping multiple files calls onDrop with both files', async function (assert) {
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

  test('multiple=true dropping multiple files calls onDrop with both files', async function (assert) {
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

  test('multiple=false dropping multiple files calls onDrop with one file', async function (assert) {
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

  test('allowFolderDrop=true allows dropping a directory and reads out the content', async function (assert) {
    this.onDrop = (files) => {
      files.forEach((file) => assert.step(file.name));
    };

    await render(hbs`
        <FileDropzone
          class="test-dropzone"
          @queue={{this.queue}}
          @allowFolderDrop={{true}}
          @onDrop={{this.onDrop}} />
      `);

    await dragAndDropDirectory('.test-dropzone', 'directory-name', [
      new File([], 'dingus.txt'),
      new File([], 'dingus.png'),
    ]);

    assert.verifySteps(['directory-name', 'dingus.txt', 'dingus.png']);
  });

  // Check for regression of: https://github.com/adopted-ember-addons/ember-file-upload/issues/446
  test('regression: drop events from other DOM nodes are not prevented', async function (assert) {
    this.documentDragListener = () =>
      assert.step('documentDragListener called');
    await render(hbs`
      <FileDropzone @queue={{this.queue}} />

      <div class="independent-drag-target"></div>
    `);
    document.addEventListener('drop', this.documentDragListener);

    await triggerEvent('.independent-drag-target', 'drop');

    assert.verifySteps(
      ['documentDragListener called'],
      'event reached documentDragListener'
    );
  });
});
