import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, click } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

import { selectFiles } from 'ember-file-upload/test-support';
import { DEFAULT_QUEUE } from 'ember-file-upload/services/file-queue';

module('Integration | Helper | file-queue', function (hooks) {
  setupRenderingTest(hooks);

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
          <input type="file" {{queue.selectFile filesSelected=this.selectFiles}} hidden>
          Select File
        </label>
      {{/let}}
    `);

    await selectFiles('input[type=file]', new File([], 'dingus.txt'));

    assert.verifySteps(['files selected: dingus.txt']);
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
      {{#let (file-queue fileAdded=this.addFile fileRemoved=this.removeFile) as |queue|}}
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
});
