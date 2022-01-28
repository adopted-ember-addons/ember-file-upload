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

    test('filesEnter', async function (assert) {
      this.filesEnter = (files) =>
        files.forEach((file) => assert.step(file.name));
      await render(hbs`
        <FileDropzone
          class="test-dropzone"
          @queue={{this.queue}}
          @filesEnter={{this.filesEnter}}
        />
      `);

      await dragEnter('.test-dropzone', new File([], 'dingus.txt'));

      assert.verifySteps(['dingus.txt']);
    });

    test('filesLeave', async function (assert) {
      this.filesLeave = (files) =>
        files.forEach((file) => assert.step(file.name));
      await render(hbs`
        <FileDropzone
          class="test-dropzone"
          @queue={{this.queue}}
          @filesLeave={{this.filesLeave}}
        />
      `);

      await dragEnter('.test-dropzone', new File([], 'dingus.txt'));
      await dragLeave('.test-dropzone', new File([], 'dingus.txt'));

      assert.verifySteps(['dingus.txt']);
    });

    test('filter and filesDropped', async function (assert) {
      this.filter = (file) => file.name.includes('.txt');
      this.filesDropped = (files) =>
        files.forEach((file) => assert.step(file.name));
      await render(hbs`
        <FileDropzone
          class="test-dropzone"
          @queue={{this.queue}}
          @filter={{this.filter}}
          @filesDropped={{this.filesDropped}}
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
  });

  module('deprecated api', function () {
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

    // TODO remove this functionality and test
    test('only calls onFileAdd for files returned from onDrop', async function (assert) {
      this.onDrop = (files) => {
        assert.step(`onDrop: ${files.mapBy('name').join(',')}`);
        return files.filter((f) => f.type.split('/')[0] === 'text');
      };
      this.onFileAdd = (file) => assert.step(`onFileAdd: ${file.name}`);

      await render(hbs`
        <FileDropzone
          class="test-dropzone"
          @name="test"
          @multiple={{true}}
          @onDrop={{this.onDrop}}
          @onFileAdd={{this.onFileAdd}}
        />
      `);

      await dragAndDrop(
        '.test-dropzone',
        new File([], 'dingus.html', { type: 'text/html' }),
        new File([], 'dingus.png', { type: 'image/png' })
      );

      assert.verifySteps([
        'onDrop: dingus.html,dingus.png',
        'onFileAdd: dingus.html',
      ]);
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
});
