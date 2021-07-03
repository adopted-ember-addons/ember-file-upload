import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import {
  dragAndDrop,
  dragEnter,
  dragLeave,
} from 'ember-file-upload/test-support';

module('Integration | Component | FileDropzone', function (hooks) {
  setupRenderingTest(hooks);

  test('dropping a file calls onDrop', async function (assert) {
    this.onDrop = (dataTransfer) => {
      dataTransfer.get('files').forEach((file) => assert.step(file.name));
    };

    await render(hbs`
      <FileDropzone
        class="test-dropzone"
        @name="test"
        @onDrop={{this.onDrop}} />
    `);

    await dragAndDrop('.test-dropzone', new File([], 'dingus.txt'));

    assert.verifySteps(['dingus.txt']);
  });

  test('deprecated: dropping a file calls ondrop', async function (assert) {
    this.onDrop = (dataTransfer) => {
      dataTransfer.get('files').forEach((file) => assert.step(file.name));
    };

    await render(hbs`
      <FileDropzone
        class="test-dropzone"
        @name="test"
        @ondrop={{this.onDrop}} />
    `);

    await dragAndDrop('.test-dropzone', new File([], 'dingus.txt'));

    assert.verifySteps(['dingus.txt']);
  });

  test('dropping multiple files calls onDrop with one file', async function (assert) {
    this.onDrop = (dataTransfer) => {
      dataTransfer.get('files').forEach((file) => assert.step(file.name));
    };

    await render(hbs`
      <FileDropzone
        class="test-dropzone"
        @name="test"
        @onDrop={{this.onDrop}} />
    `);

    await dragAndDrop(
      '.test-dropzone',
      new File([], 'dingus.txt'),
      new File([], 'dingus.png')
    );

    assert.verifySteps(['dingus.txt']);
  });

  test('deprecated: dropping multiple files calls ondrop with one file', async function (assert) {
    this.onDrop = (dataTransfer) => {
      dataTransfer.get('files').forEach((file) => assert.step(file.name));
    };

    await render(hbs`
      <FileDropzone
        class="test-dropzone"
        @name="test"
        @ondrop={{this.onDrop}} />
    `);

    await dragAndDrop(
      '.test-dropzone',
      new File([], 'dingus.txt'),
      new File([], 'dingus.png')
    );

    assert.verifySteps(['dingus.txt']);
  });

  test('multiple=true dropping multiple files calls onDrop with both files', async function (assert) {
    this.onDrop = (dataTransfer) => {
      dataTransfer.get('files').forEach((file) => assert.step(file.name));
    };

    await render(hbs`
      <FileDropzone
        class="test-dropzone"
        @name="test"
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

  test('deprecated: multiple=true dropping multiple files calls ondrop with both files', async function (assert) {
    this.onDrop = (dataTransfer) => {
      dataTransfer.get('files').forEach((file) => assert.step(file.name));
    };

    await render(hbs`
      <FileDropzone
        class="test-dropzone"
        @name="test"
        @multiple={{true}}
        @ondrop={{this.onDrop}} />
    `);

    await dragAndDrop(
      '.test-dropzone',
      new File([], 'dingus.txt'),
      new File([], 'dingus.png')
    );

    assert.verifySteps(['dingus.txt', 'dingus.png']);
  });

  test('onDragEnter is called when a file is dragged over', async function (assert) {
    this.onDragEnter = () => assert.step('onDragEnter');

    await render(hbs`
      <FileDropzone
        class="test-dropzone"
        @name="test"
        @onDragEnter={{this.onDragEnter}} />
    `);

    await dragEnter('.test-dropzone');

    assert.verifySteps(['onDragEnter']);
  });

  test('deprecated: ondragenter is called when a file is dragged over', async function (assert) {
    this.onDragEnter = () => assert.step('onDragEnter');

    await render(hbs`
      <FileDropzone
        class="test-dropzone"
        @name="test"
        @ondragenter={{this.onDragEnter}} />
    `);

    await dragEnter('.test-dropzone');

    assert.verifySteps(['onDragEnter']);
  });

  test('onDragLeave is called when a file is dragged out', async function (assert) {
    this.onDragLeave = () => assert.step('onDragLeave');

    await render(hbs`
      <FileDropzone
        class="test-dropzone"
        @name="test"
        @onDragLeave={{this.onDragLeave}} />
    `);

    await dragEnter('.test-dropzone', new File([], 'dingus.txt'));
    await dragLeave('.test-dropzone', new File([], 'dingus.txt'));

    assert.verifySteps(['onDragLeave']);
  });

  test('deprecated: ondragleave is called when a file is dragged out', async function (assert) {
    this.onDragLeave = () => assert.step('onDragLeave');

    await render(hbs`
      <FileDropzone
        class="test-dropzone"
        @name="test"
        @ondragleave={{this.onDragLeave}} />
    `);

    await dragEnter('.test-dropzone', new File([], 'dingus.txt'));
    await dragLeave('.test-dropzone', new File([], 'dingus.txt'));

    assert.verifySteps(['onDragLeave']);
  });

  test('yielded properties', async function (assert) {
    await render(hbs`
      <FileDropzone @name="test" as |dropzone queue|>
        <div class="supported">{{dropzone.supported}}</div>
        <div class="active">{{dropzone.active}}</div>
        <div class="valid">{{dropzone.valid}}</div>
        <div class="queue-name">{{queue.name}}</div>
      </FileDropzone>
    `);

    assert.dom('.supported').hasText('true');
    assert.dom('.active').hasText('false');
    assert.dom('.valid').hasText('true');
    assert.dom('.queue-name').hasText('test');
  });
});
