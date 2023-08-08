import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { TestContext, render, settled } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { selectFiles } from 'ember-file-upload/test-support';
import { tracked } from '@glimmer/tracking';
import type { FileQueueService, Queue, UploadFile } from 'ember-file-upload';

class State {
  @tracked firstComponent = true;
}

interface LocalTestContext extends TestContext {
  state: State;
  queue: Queue;
  firstOnFilesSelected: (files: UploadFile[]) => void;
  secondOnFilesSelected: (files: UploadFile[]) => void;
  firstOnFileAdd: (file: UploadFile) => void;
  secondOnFileAdd: (file: UploadFile) => void;
}

module('Integration | queue listeners', function (hooks) {
  setupRenderingTest(hooks);

  const setupState = function (this: LocalTestContext) {
    const fileQueueService = this.owner.lookup(
      'service:file-queue'
    ) as FileQueueService;

    this.state = new State();
    this.queue = fileQueueService.create('listener-test');
  };

  const assertOnlyRenderedComponentCallbacks = async function (
    this: LocalTestContext,
    assert: Assert
  ) {
    await selectFiles('input[type=file]', new File([], 'first.txt'));
    this.state.firstComponent = false;
    await settled();
    await selectFiles('input[type=file]', new File([], 'second.txt'));

    assert.verifySteps([
      'first component: first.txt',
      'second component: second.txt',
    ]);
  };

  test('attaches and detaches onFilesSelected from queue', async function (this: LocalTestContext, assert) {
    assert.expect(3);
    setupState.bind(this)();

    this.firstOnFilesSelected = ([file]) => {
      assert.step(`first component: ${file?.name}`);
    };
    this.secondOnFilesSelected = ([file]) => {
      assert.step(`second component: ${file?.name}`);
    };

    await render<LocalTestContext>(hbs`
      {{#if this.state.firstComponent}}
        <label>
          <input type="file" {{this.queue.selectFile onFilesSelected=this.firstOnFilesSelected}} />
        </label>
      {{else}}
        <label>
          <input type="file" {{this.queue.selectFile onFilesSelected=this.secondOnFilesSelected}} />
        </label>
      {{/if}}
    `);

    await assertOnlyRenderedComponentCallbacks.bind(this)(assert);
  });

  test('attaches and detaches onFileAdd from queue', async function (this: LocalTestContext, assert) {
    assert.expect(3);
    setupState.bind(this)();

    this.firstOnFileAdd = (file) => {
      assert.step(`first component: ${file?.name}`);
    };
    this.secondOnFileAdd = (file) => {
      assert.step(`second component: ${file?.name}`);
    };

    await render<LocalTestContext>(hbs`
      {{#if this.state.firstComponent}}
        {{#let (file-queue onFileAdded=this.firstOnFileAdd) as |queue|}}
          <label>
            <input type="file" {{queue.selectFile}} />
          </label>
        {{/let}}
      {{else}}
        {{#let (file-queue onFileAdded=this.secondOnFileAdd) as |queue|}}
          <label>
            <input type="file" {{queue.selectFile}} />
          </label>
        {{/let}}
      {{/if}}
    `);

    await assertOnlyRenderedComponentCallbacks.bind(this)(assert);
  });
});
