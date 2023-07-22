import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, settled, TestContext } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { UploadFile, FileSource, FileQueueService } from 'ember-file-upload';

interface LocalTestContext extends TestContext {
  subject: FileQueueService;
}

module('Integration | Service | file queue', function (hooks) {
  setupRenderingTest(hooks);

  test('files is reactive', async function (this: LocalTestContext, assert) {
    this.subject = this.owner.lookup('service:file-queue') as FileQueueService;

    const existingQueue = this.subject.create('existing-queue');
    const existingQueueFile = new UploadFile(
      new File([], 'existing-queue-file.txt'),
      FileSource.Browse
    );
    existingQueue.add(existingQueueFile);

    await render(hbs`
      <div id="files">
        {{#each this.subject.files as |file|}}
          {{file.name}}
        {{/each}}
      </div>
    `);

    assert
      .dom('#files')
      .containsText('existing-queue-file.txt', 'renders existing queue file');

    const newQueue = this.subject.create('new-queue');
    const newQueueFile = new UploadFile(
      new File([], 'new-queue-file.txt'),
      FileSource.Browse
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
