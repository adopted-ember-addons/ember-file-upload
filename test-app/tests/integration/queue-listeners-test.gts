import { module, test, assert } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { type TestContext, render, settled } from '@ember/test-helpers';
import { selectFiles } from 'ember-file-upload/test-support';
import { tracked } from '@glimmer/tracking';
import fileQueue from 'ember-file-upload/helpers/file-queue';
import type { UploadFile } from 'ember-file-upload';

class State {
  @tracked firstComponent = true;
}

type Assert = typeof assert;

module('Integration | queue listeners', function (hooks) {
  setupRenderingTest(hooks);

  const setupState = function (this: TestContext) {
    const fileQueueService = this.owner.lookup('service:file-queue');

    return {
      state: new State(),
      queue: fileQueueService.create('listener-test'),
    };
  };

  const assertOnlyRenderedComponentCallbacks = async function (
    state: State,
    assert: Assert,
  ) {
    await selectFiles('input[type=file]', new File([], 'first.txt'));
    state.firstComponent = false;
    await settled();
    await selectFiles('input[type=file]', new File([], 'second.txt'));

    assert.verifySteps([
      'first component: first.txt',
      'second component: second.txt',
    ]);
  };

  test('attaches and detaches onFilesSelected from queue', async function (this: TestContext, assert) {
    const { state, queue } = setupState.bind(this)();

    const firstOnFilesSelected = ([file]: UploadFile[]) => {
      assert.step(`first component: ${file?.name}`);
    };
    const secondOnFilesSelected = ([file]: UploadFile[]) => {
      assert.step(`second component: ${file?.name}`);
    };

    await render(<template>
      {{#if state.firstComponent}}
        <label>
          <input
            type='file'
            {{queue.selectFile onFilesSelected=firstOnFilesSelected}}
          />
        </label>
      {{else}}
        <label>
          <input
            type='file'
            {{queue.selectFile onFilesSelected=secondOnFilesSelected}}
          />
        </label>
      {{/if}}
    </template>);

    await assertOnlyRenderedComponentCallbacks(state, assert);
  });

  test('attaches and detaches onFileAdd from queue', async function (this: TestContext, assert) {
    const { state, queue } = setupState.bind(this)();

    const firstOnFileAdd = (file: UploadFile) => {
      assert.step(`first component: ${file?.name}`);
    };
    const secondOnFileAdd = (file: UploadFile) => {
      assert.step(`second component: ${file?.name}`);
    };

    await render(<template>
      {{#if state.firstComponent}}
        {{#let (fileQueue onFileAdded=firstOnFileAdd) as |queue|}}
          <label>
            <input type="file" {{queue.selectFile}} />
          </label>
        {{/let}}
      {{else}}
        {{#let (fileQueue onFileAdded=secondOnFileAdd) as |queue|}}
          <label>
            <input type="file" {{queue.selectFile}} />
          </label>
        {{/let}}
      {{/if}}
    </template>);

    await assertOnlyRenderedComponentCallbacks(state, assert);
  });
});
