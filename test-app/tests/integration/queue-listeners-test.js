import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, settled } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { selectFiles } from 'ember-file-upload/test-support';
import { tracked } from '@glimmer/tracking';

module('Integration | queue listeners', function (hooks) {
  setupRenderingTest(hooks);

  const setupState = function () {
    const fileQueueService = this.owner.lookup('service:file-queue');

    class State {
      @tracked firstComponent = true;
    }

    this.state = new State();
    this.queue = fileQueueService.create('listener-test');
  };

  const assertOnlyRenderedComponentCallbacks = async function (assert) {
    await selectFiles('input[type=file]', new File([], 'first.txt'));
    this.state.firstComponent = false;
    await settled();
    await selectFiles('input[type=file]', new File([], 'second.txt'));

    assert.verifySteps([
      'first component: first.txt',
      'second component: second.txt',
    ]);
  };

  test('attaches and detaches onFilesSelected from queue', async function (assert) {
    assert.expect(3);
    setupState.bind(this)();

    this.firstListener = ([file]) => {
      assert.step(`first component: ${file.name}`);
    };
    this.secondListener = ([file]) => {
      assert.step(`second component: ${file.name}`);
    };

    await render(hbs`
      {{#if this.state.firstComponent}}
        <FileUpload
          @queue={{this.queue}}
          @onFilesSelected={{this.firstListener}}
        />
      {{else}}
        <FileUpload
          @queue={{this.queue}}
          @onFilesSelected={{this.secondListener}}
        />
      {{/if}}
    `);

    await assertOnlyRenderedComponentCallbacks.bind(this)(assert);
  });

  test('attaches and detaches onFileAdd from queue', async function (assert) {
    assert.expect(3);
    setupState.bind(this)();

    this.firstListener = (file) => {
      assert.step(`first component: ${file.name}`);
    };
    this.secondListener = (file) => {
      assert.step(`second component: ${file.name}`);
    };

    await render(hbs`
      {{#if this.state.firstComponent}}
        <FileUpload
          @queue={{this.queue}}
          @onFileAdd={{this.firstListener}}
        />
      {{else}}
        <FileUpload
          @queue={{this.queue}}
          @onFileAdd={{this.secondListener}}
        />
      {{/if}}
    `);

    await assertOnlyRenderedComponentCallbacks.bind(this)(assert);
  });
});
