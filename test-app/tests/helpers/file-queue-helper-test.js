import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import { Response } from 'miragejs';
import { render, click, settled, waitFor } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { DEFAULT_QUEUE, FileState } from 'ember-file-upload';
import { selectFiles } from 'ember-file-upload/test-support';
import { uploadHandler } from 'ember-file-upload';
import { later } from '@ember/runloop';

module('Integration | Helper | file-queue', function (hooks) {
  setupRenderingTest(hooks);
  setupMirage(hooks);

  test('filter is triggered when selecting files', async function (assert) {
    this.filter = (file) => assert.step(`filter: ${file.name}`);

    await render(hbs`
      {{#let (file-queue) as |queue|}}
        <label>
          <input type="file" {{queue.selectFile filter=this.filter}} hidden>
          Select File
        </label>
      {{/let}}
    `);

    await selectFiles('input[type=file]', new File([], 'dingus.txt'));

    assert.verifySteps(['filter: dingus.txt']);
  });

  test('files selected is triggered when selecting files', async function (assert) {
    this.selectFiles = (files) =>
      assert.step(
        `files selected: ${files.map((file) => file.name).join(', ')}`
      );

    await render(hbs`
      {{#let (file-queue) as |queue|}}
        <label>
          <input type="file" {{queue.selectFile onFilesSelected=this.selectFiles}} hidden>
          Select File
        </label>
      {{/let}}
    `);

    await selectFiles('input[type=file]', new File([], 'dingus.txt'));
    await selectFiles('input[type=file]', new File([], 'dingus.txt'));
    await selectFiles('input[type=file]', new File([], 'dingus.png'));

    assert.verifySteps([
      'files selected: dingus.txt',
      'files selected: dingus.txt',
      'files selected: dingus.png',
    ]);
  });

  test('falls back to default name', async function (assert) {
    await render(hbs`
      {{#let (file-queue) as |queue|}}
        <output>{{queue.name}}</output>
      {{/let}}
    `);

    assert.dom('output').hasText(DEFAULT_QUEUE.toString());
  });

  test('can be parametrized by name', async function (assert) {
    await render(hbs`
      {{#let (file-queue name="line-up") as |queue|}}
        <output>{{queue.name}}</output>
      {{/let}}
    `);

    assert.dom('output').hasText('line-up');
  });

  test('will be notified when adding and removing files', async function (assert) {
    this.addFile = (file) => assert.step(`file added: ${file.name}`);
    this.removeFile = (file) => assert.step(`file removed: ${file.name}`);

    await render(hbs`
      {{#let (file-queue onFileAdded=this.addFile onFileRemoved=this.removeFile) as |queue|}}
        {{#each queue.files as |file|}}
          <span data-test-file>
          {{file.name}}
          </span>
          <button
            type="button"
            data-test-remove
            {{on "click" (fn queue.remove file)}}
          >
            x
          </button>
        {{/each}}

        <label>
          <input type="file" {{queue.selectFile}} hidden>
          Select File
        </label>
      {{/let}}
    `);

    assert.dom('[data-test-file]').doesNotExist();

    await selectFiles('input[type=file]', new File([], 'dingus.txt'));
    assert.dom('[data-test-file]').hasText('dingus.txt');

    await click('[data-test-remove]');
    assert.verifySteps(['file added: dingus.txt', 'file removed: dingus.txt']);

    assert.dom('[data-test-file]').doesNotExist();
  });

  test('will be notified when an upload starts', async function (assert) {
    this.server.post(
      '/upload-file',
      uploadHandler(() => {})
    );

    this.upload = (file) => file.upload('/upload-file');

    this.uploadStarted = (file) =>
      assert.step(`upload started: ${file.name}, state: ${file.state}`);

    await render(hbs`
      {{#let (file-queue onFileAdded=this.upload onUploadStarted=this.uploadStarted) as |queue|}}
        <label>
          <input type="file" {{queue.selectFile}}>
          Select File
        </label>
      {{/let}}
    `);

    await selectFiles('input[type=file]', new File([], 'dingus.txt'));

    assert.verifySteps(['upload started: dingus.txt, state: uploading']);
  });

  test('will be notified when an upload is successful', async function (assert) {
    this.server.post(
      '/upload-file',
      uploadHandler(() => {})
    );

    this.upload = (file) => file.upload('/upload-file');

    this.uploadSucceeded = (file, response) =>
      assert.step(
        `upload succeeded: ${file.name}, state: ${file.state}, response.status: ${response.status}`
      );

    await render(hbs`
      {{#let (file-queue onFileAdded=this.upload onUploadSucceeded=this.uploadSucceeded) as |queue|}}
        <label>
          <input type="file" {{queue.selectFile}}>
          Select File
        </label>
      {{/let}}
    `);

    await selectFiles('input[type=file]', new File([], 'dingus.txt'));

    assert.verifySteps([
      'upload succeeded: dingus.txt, state: uploading, response.status: 201',
    ]);
  });

  test('will be notified when an upload fails', async function (assert) {
    this.server.post(
      '/upload-file',
      uploadHandler(() => new Response(500))
    );

    this.upload = (file) => file.upload('/upload-file');

    this.uploadFailed = (file, response) => {
      assert.step(
        `upload failed: ${file.name}, state: ${file.state}, status: ${response.status}`
      );
    };

    await render(hbs`
      {{#let (file-queue onFileAdded=this.upload onUploadFailed=this.uploadFailed) as |queue|}}
        <label>
          <input type="file" {{queue.selectFile}}>
          Select File
        </label>
      {{/let}}
    `);

    await selectFiles('input[type=file]', new File([], 'dingus.txt'));

    assert.verifySteps([
      'upload failed: dingus.txt, state: uploading, status: 500',
    ]);
  });

  test('files in the queue are autotracked', async function (assert) {
    this.simulateUpload = (file) => {
      file.state = FileState.Uploading;
      later(() => (file.state = FileState.Uploaded), 100);
    };

    await render(hbs`
      {{#let (file-queue onFileAdded=this.simulateUpload) as |queue|}}
        {{#each queue.files as |file|}}
          <span data-test-file>{{file.name}}</span>
        {{/each}}

        <label>
          <input type="file" {{queue.selectFile}}>
          Select File
        </label>
      {{/let}}
    `);

    // Choose file (but don't wait)
    selectFiles('input[type=file]', new File([], 'first.txt'));

    // Enqueued file should be visible
    await waitFor('[data-test-file]');
    assert.dom('[data-test-file]').hasText('first.txt', 'first.txt is queued');

    // Allow upload to complete
    await settled();
    assert.dom('[data-test-file]').doesNotExist('queue was flushed');

    // Choose file (but don't wait)
    selectFiles('input[type=file]', new File([], 'second.txt'));

    // Enqueued file should be visible
    await waitFor('[data-test-file]');
    assert
      .dom('[data-test-file]')
      .hasText('second.txt', 'second.txt is queued');

    // Allow upload to complete
    await settled();
    assert.dom('[data-test-file]').doesNotExist('queue was flushed');
  });
});
