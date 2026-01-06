import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { Response as MirageResponse } from 'miragejs';
import { render, click, settled, waitFor } from '@ember/test-helpers';
import { DEFAULT_QUEUE, FileState } from 'ember-file-upload';
import type { UploadFile } from 'ember-file-upload';
import { selectFiles } from 'ember-file-upload/test-support';
import { uploadHandler } from 'ember-file-upload';
import fileQueue from 'ember-file-upload/helpers/file-queue';
import { on } from '@ember/modifier';
import { fn } from '@ember/helper';
import { waitForPromise } from '@ember/test-waiters';

import {
  type MirageTestContext,
  setupMirage,
} from 'ember-cli-mirage/test-support';

module('Integration | Helper | file-queue', function (hooks) {
  setupRenderingTest(hooks);
  setupMirage(hooks);

  test('filter is triggered when selecting files', async function (assert) {
    const filter = (file: File) => {
      assert.step(`filter: ${file.name}`);
      return true;
    };

    await render(
      <template>
        {{#let (fileQueue) as |queue|}}
          <label>
            <input type="file" {{queue.selectFile filter=filter}} hidden />
            Select File
          </label>
        {{/let}}
      </template>,
    );

    await selectFiles('input[type=file]', new File([], 'dingus.txt'));

    assert.verifySteps(['filter: dingus.txt']);
  });

  test('files selected is triggered when selecting files', async function (assert) {
    const filesSelected = (files: UploadFile[]) =>
      assert.step(
        `files selected: ${files.map((file) => file.name).join(', ')}`,
      );

    await render(
      <template>
        {{#let (fileQueue) as |queue|}}
          <label>
            <input
              type="file"
              {{queue.selectFile onFilesSelected=filesSelected}}
              hidden
            />
            Select File
          </label>
        {{/let}}
      </template>,
    );

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
    await render(
      <template>
        {{#let (fileQueue) as |queue|}}
          {{! @glint-ignore }}
          <span>{{queue.name}}</span>
        {{/let}}
      </template>,
    );

    assert.dom('span').hasText(DEFAULT_QUEUE.toString());
  });

  test('can be parametrized by name', async function (assert) {
    await render(
      <template>
        {{#let (fileQueue name="line-up") as |queue|}}
          {{! @glint-ignore }}
          <output>{{queue.name}}</output>
        {{/let}}
      </template>,
    );

    assert.dom('output').hasText('line-up');
  });

  test('will be notified when adding and removing files', async function (assert) {
    const fileAdded = (file: UploadFile) =>
      assert.step(`file added: ${file.name}`);
    const fileRemoved = (file: UploadFile) =>
      assert.step(`file removed: ${file.name}`);

    await render(
      <template>
        {{#let
          (fileQueue onFileAdded=fileAdded onFileRemoved=fileRemoved)
          as |queue|
        }}
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
            <input type="file" {{queue.selectFile}} hidden />
            Select File
          </label>
        {{/let}}
      </template>,
    );

    assert.dom('[data-test-file]').doesNotExist();

    await selectFiles('input[type=file]', new File([], 'dingus.txt'));
    assert.dom('[data-test-file]').hasText('dingus.txt');

    await click('[data-test-remove]');
    assert.verifySteps(['file added: dingus.txt', 'file removed: dingus.txt']);

    assert.dom('[data-test-file]').doesNotExist();
  });

  test('will be notified when an upload starts', async function (this: MirageTestContext, assert) {
    this.server.post(
      '/upload-file',
      uploadHandler(() => {}),
    );

    const upload = (file: UploadFile) => file.upload('/upload-file');

    const uploadStarted = (file: UploadFile) => {
      assert.step('upload started');
      assert.strictEqual(file.name, 'dingus.txt', 'file name present');
      assert.strictEqual(
        file.state,
        FileState.Uploading,
        'file state is uploading',
      );
    };

    await render(
      <template>
        {{#let
          (fileQueue onFileAdded=upload onUploadStarted=uploadStarted)
          as |queue|
        }}
          <label>
            <input type="file" {{queue.selectFile}} />
            Select File
          </label>
        {{/let}}
      </template>,
    );

    await selectFiles('input[type=file]', new File([], 'dingus.txt'));

    assert.verifySteps(['upload started']);
  });

  test('will be notified when an upload is successful', async function (this: MirageTestContext, assert) {
    this.server.post(
      '/upload-file',
      uploadHandler(() => {}),
    );

    const upload = (file: UploadFile) => file.upload('/upload-file');

    const uploadSucceeded = (file: UploadFile, response: Response) => {
      assert.step('upload succeeded');
      assert.strictEqual(file.name, 'dingus.txt', 'file name present');
      assert.strictEqual(
        file.state,
        FileState.Uploaded,
        'file state is uploaded',
      );
      assert.strictEqual(response.status, 201, 'response status present');
    };

    await render(
      <template>
        {{#let
          (fileQueue onFileAdded=upload onUploadSucceeded=uploadSucceeded)
          as |queue|
        }}
          <label>
            <input type="file" {{queue.selectFile}} />
            Select File
          </label>
        {{/let}}
      </template>,
    );

    await selectFiles('input[type=file]', new File([], 'dingus.txt'));

    assert.verifySteps(['upload succeeded']);
  });

  test('will be notified when an upload fails', async function (this: MirageTestContext, assert) {
    this.server.post(
      '/upload-file',
      uploadHandler(() => new MirageResponse(500)),
    );

    const upload = (file: UploadFile) => {
      file.upload('/upload-file').catch(function(response: Response) {
        assert.step('upload promise rejected');
        assert.strictEqual(response.status, 500, 'rejected with response object');
      })
    };

    const uploadFailed = (file: UploadFile, response: Response) => {
      assert.step('upload failed');
      assert.strictEqual(file.name, 'dingus.txt', 'file name present');
      assert.strictEqual(file.state, FileState.Failed, 'file state is failed');
      assert.strictEqual(response.status, 500, 'response status present');
    };

    await render(
      <template>
        {{#let
          (fileQueue onFileAdded=upload onUploadFailed=uploadFailed)
          as |queue|
        }}
          <label>
            <input type="file" {{queue.selectFile}} />
            Select File
          </label>
        {{/let}}
      </template>,
    );

    await selectFiles('input[type=file]', new File([], 'dingus.txt'));

    assert.verifySteps(['upload failed', 'upload promise rejected'], 'onUploadFailed was called and the upload promise rejected');
  });

  test('files in the queue are autotracked', async function (assert) {
    const fileAdded = (file: UploadFile) => {
      file.state = FileState.Uploading;
      // Using waitForPromise to ensure the tests wait for this operation before continuing
      waitForPromise(new Promise((resolve) => {
        setTimeout(() => {
          file.state = FileState.Uploaded;
          file.queue?.flush();
          resolve()
        }, 100);
      }));
    };

    await render(
      <template>
        {{#let (fileQueue onFileAdded=fileAdded) as |queue|}}
          {{#each queue.files as |file|}}
            <span data-test-file>{{file.name}}</span>
          {{/each}}

          <label>
            <input type="file" {{queue.selectFile}} />
            Select File
          </label>
        {{/let}}
      </template>,
    );

    // Choose file (but don't wait)
    void selectFiles('input[type=file]', new File([], 'first.txt'));

    // Enqueued file should be visible
    await waitFor('[data-test-file]');
    assert.dom('[data-test-file]').hasText('first.txt', 'first.txt is queued');

    // Allow upload to complete
    await settled();
    assert.dom('[data-test-file]').doesNotExist('queue was flushed');

    // Choose file (but don't wait)
    void selectFiles('input[type=file]', new File([], 'second.txt'));

    // Enqueued file should be visible
    await waitFor('[data-test-file]');
    assert
      .dom('[data-test-file]')
      .hasText('second.txt', 'second.txt is queued');

    // Allow upload to complete
    await settled();
    assert.dom('[data-test-file]').doesNotExist('queue was flushed');
  });

  // Service before helper issue ref: https://github.com/adopted-ember-addons/ember-file-upload/issues/1085
  test('service can be used before helper with DEFUALT_QUEUE', async function (assert) {
    const fileQueueService = this.owner.lookup('service:file-queue');

    await render(
      <template>
        <ul>
          {{#each fileQueueService.files as |file|}}
            <li>
              {{file.name}}
            </li>
          {{/each}}
        </ul>

        {{#let (fileQueue) as |queue|}}
          <label>
            <input type="file" {{queue.selectFile}} hidden />
            Select File
          </label>
        {{/let}}
      </template>,
    );

    assert.dom('label').exists('regression would throw during rendering');
  });

  test('service can be used before helper with named queue, provided FileQueueService.create is called first', async function (assert) {
    const fileQueueService = this.owner.lookup('service:file-queue');
    const customName = 'uploads';
    fileQueueService.create(customName);

    await render(
      <template>
        <ul>
          {{#each fileQueueService.files as |file|}}
            <li>
              {{file.name}}
            </li>
          {{/each}}
        </ul>

        {{#let (fileQueue name=customName) as |queue|}}
          <label>
            <input type="file" {{queue.selectFile}} hidden />
            Select File
          </label>
        {{/let}}
      </template>,
    );

    assert.dom('label').exists('regression would throw during rendering');
  });
});
