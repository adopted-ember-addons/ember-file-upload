import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import {
  dragAndDrop,
  dragEnter,
  dragLeave,
} from 'ember-file-upload/test-support';
import Queue from 'ember-file-upload/queue';

module('Integration | Component | FileDropzone', function (hooks) {
  setupRenderingTest(hooks);

  module('new api', function (hooks) {
    hooks.beforeEach(function () {
      const fileQueueService = this.owner.lookup('service:file-queue');
      this.queue = new Queue({ name: 'test', fileQueue: fileQueueService });
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
          @name="test"
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
          @name="test"
          @onDragLeave={{this.onDragLeave}} />
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
          <div class="queue-name">{{queue.name}}</div>
        </FileDropzone>
      `);

      assert.dom('.supported').hasText('true');
      assert.dom('.active').hasText('false');
      assert.dom('.queue-name').hasText('test');
    });
  });

  module('deprecated api', function () {
    test('dropping multiple files calls onFileAdd with each file', async function (assert) {
      this.onFileAdd = (file) => assert.step(file.name);

      await render(hbs`
        <FileDropzone
          class="test-dropzone"
          @name="test"
          @onFileAdd={{this.onFileAdd}} />
      `);

      await dragAndDrop(
        '.test-dropzone',
        new File([], 'dingus.txt'),
        new File([], 'dingus.png')
      );

      assert.verifySteps(['dingus.txt', 'dingus.png']);
    });

    test('dropping multiple files calls onDrop with both files', async function (assert) {
      this.onDrop = (files) => files.forEach((file) => assert.step(file.name));

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

      assert.verifySteps(['dingus.txt', 'dingus.png']);
    });

    test('multiple=true dropping multiple files calls onDrop with both files', async function (assert) {
      this.onDrop = (files) => files.forEach((file) => assert.step(file.name));

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

    test('multiple=false dropping multiple files calls onDrop with one file', async function (assert) {
      this.onDrop = (files) => files.forEach((file) => assert.step(file.name));

      await render(hbs`
        <FileDropzone
          class="test-dropzone"
          @name="test"
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
  });
});
