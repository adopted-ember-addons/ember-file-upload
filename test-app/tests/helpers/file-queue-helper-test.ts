import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { Response as MirageResponse } from 'miragejs';
import { render, click, settled, waitFor } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { DEFAULT_QUEUE, FileState } from 'ember-file-upload';
import type { UploadFile } from 'ember-file-upload';
import { selectFiles } from 'ember-file-upload/test-support';
import { uploadHandler } from 'ember-file-upload';
import { later } from '@ember/runloop';

import {
  type MirageTestContext,
  setupMirage,
} from 'ember-cli-mirage/test-support';

interface LocalContext extends MirageTestContext {
  filter: (file: File, files: File[], index: number) => boolean;
  filesSelected: (files: UploadFile[]) => void;
  fileAdded: (file: UploadFile) => void;
  fileRemoved: (file: UploadFile) => void;
  upload: (file: UploadFile) => void;
  uploadStarted: (file: UploadFile) => void;
  uploadSucceeded: (file: UploadFile, response: Response) => void;
  uploadFailed: (file: UploadFile, response: Response) => void;
}

module('Integration | Helper | file-queue', function (hooks) {
  setupRenderingTest(hooks);
  setupMirage(hooks);

  test('filter is triggered when selecting files', async function (this: LocalContext, assert) {
    this.filter = (file) => {
      assert.step(`filter: ${file.name}`);
      return true;
    };

    await render<LocalContext>(hbs`
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

  test('files selected is triggered when selecting files', async function (this: LocalContext, assert) {
    this.filesSelected = (files) =>
      assert.step(
        `files selected: ${files.map((file) => file.name).join(', ')}`,
      );

    await render<LocalContext>(hbs`
      {{#let (file-queue) as |queue|}}
        <label>
          <input type="file" {{queue.selectFile onFilesSelected=this.filesSelected}} hidden>
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

  test('falls back to default name', async function (this: LocalContext, assert) {
    await render<LocalContext>(hbs`
      {{#let (file-queue) as |queue|}}
        <output>{{to-string queue.name}}</output>
      {{/let}}
    `);

    assert.dom('output').hasText(DEFAULT_QUEUE.toString());
  });

  test('can be parametrized by name', async function (this: LocalContext, assert) {
    await render<LocalContext>(hbs`
      {{#let (file-queue name="line-up") as |queue|}}
        <output>{{to-string queue.name}}</output>
      {{/let}}
    `);

    assert.dom('output').hasText('line-up');
  });

  test('will be notified when adding and removing files', async function (this: LocalContext, assert) {
    this.fileAdded = (file) => assert.step(`file added: ${file.name}`);
    this.fileRemoved = (file) => assert.step(`file removed: ${file.name}`);

    await render<LocalContext>(hbs`
      {{#let (file-queue onFileAdded=this.fileAdded onFileRemoved=this.fileRemoved) as |queue|}}
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

  test('will be notified when an upload starts', async function (this: LocalContext, assert) {
    assert.expect(4);

    this.server.post(
      '/upload-file',
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      uploadHandler(() => {}),
    );

    this.upload = (file) => file.upload('/upload-file');

    this.uploadStarted = (file) => {
      assert.step('upload started');
      assert.strictEqual(file.name, 'dingus.txt', 'file name present');
      assert.strictEqual(
        file.state,
        FileState.Uploading,
        'file state is uploading',
      );
    };

    await render<LocalContext>(hbs`
      {{#let (file-queue onFileAdded=this.upload onUploadStarted=this.uploadStarted) as |queue|}}
        <label>
          <input type="file" {{queue.selectFile}}>
          Select File
        </label>
      {{/let}}
    `);

    await selectFiles('input[type=file]', new File([], 'dingus.txt'));

    assert.verifySteps(['upload started']);
  });

  test('will be notified when an upload is successful', async function (this: LocalContext, assert) {
    assert.expect(5);

    this.server.post(
      '/upload-file',
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      uploadHandler(() => {}),
    );

    this.upload = (file) => file.upload('/upload-file');

    this.uploadSucceeded = (file, response) => {
      assert.step('upload succeeded');
      assert.strictEqual(file.name, 'dingus.txt', 'file name present');
      assert.strictEqual(
        file.state,
        FileState.Uploaded,
        'file state is uploaded',
      );
      assert.strictEqual(response.status, 201, 'response status present');
    };

    await render<LocalContext>(hbs`
      {{#let (file-queue onFileAdded=this.upload onUploadSucceeded=this.uploadSucceeded) as |queue|}}
        <label>
          <input type="file" {{queue.selectFile}}>
          Select File
        </label>
      {{/let}}
    `);

    await selectFiles('input[type=file]', new File([], 'dingus.txt'));

    assert.verifySteps(['upload succeeded']);
  });

  test('will be notified when an upload fails', async function (this: LocalContext, assert) {
    assert.expect(5);

    this.server.post(
      '/upload-file',
      uploadHandler(() => new MirageResponse(500)),
    );

    this.upload = (file) => file.upload('/upload-file');

    this.uploadFailed = (file, response) => {
      assert.step('upload failed');
      assert.strictEqual(file.name, 'dingus.txt', 'file name present');
      assert.strictEqual(file.state, FileState.Failed, 'file state is failed');
      assert.strictEqual(response.status, 500, 'response status present');
    };

    await render<LocalContext>(hbs`
      {{#let (file-queue onFileAdded=this.upload onUploadFailed=this.uploadFailed) as |queue|}}
        <label>
          <input type="file" {{queue.selectFile}}>
          Select File
        </label>
      {{/let}}
    `);

    await selectFiles('input[type=file]', new File([], 'dingus.txt'));

    assert.verifySteps(['upload failed'], 'onUploadFailed was called');
  });

  test('files in the queue are autotracked', async function (this: LocalContext, assert) {
    this.fileAdded = (file) => {
      file.state = FileState.Uploading;
      later(() => {
        file.state = FileState.Uploaded;
        file.queue?.flush();
      }, 100);
    };

    await render<LocalContext>(hbs`
      {{#let (file-queue onFileAdded=this.fileAdded) as |queue|}}
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
