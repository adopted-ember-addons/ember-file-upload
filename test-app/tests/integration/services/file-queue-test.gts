import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, settled, type TestContext } from '@ember/test-helpers';
import { UploadFile, FileSource } from 'ember-file-upload';

module('Integration | Service | file queue', function (hooks) {
  setupRenderingTest(hooks);

  test('files is reactive', async function (this: TestContext, assert) {
    const subject = this.owner.lookup('service:file-queue');

    const existingQueue = subject.create('existing-queue');
    const existingQueueFile = new UploadFile(
      new File([], 'existing-queue-file.txt'),
      FileSource.Browse,
    );
    existingQueue.add(existingQueueFile);

    await render(
      <template>
        <div id="files">
          {{#each subject.files as |file|}}
            {{file.name}}
          {{/each}}
        </div>
      </template>,
    );

    assert
      .dom('#files')
      .containsText('existing-queue-file.txt', 'renders existing queue file');

    const newQueue = subject.create('new-queue');
    const newQueueFile = new UploadFile(
      new File([], 'new-queue-file.txt'),
      FileSource.Browse,
    );
    newQueue.add(newQueueFile);

    await settled();

    assert
      .dom('#files')
      .containsText('existing-queue-file.txt', 'renders existing queue file');
    assert
      .dom('#files')
      .containsText('new-queue-file.txt', 'renders new queue file');
  });
});
