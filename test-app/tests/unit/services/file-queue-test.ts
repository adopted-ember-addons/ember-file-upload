import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import { FileSource, FileState, UploadFile } from 'ember-file-upload';
import { type TestContext } from '@ember/test-helpers';
import { png } from 'test-app/tests/utils/file-data';

module('Unit | Service | file-queue', function (hooks) {
  setupTest(hooks);

  test('the size of the queue is the aggregate of all queues', function (this: TestContext, assert) {
    const fileQueueService = this.owner.lookup('service:file-queue');
    const queue1 = fileQueueService.create('queue1');
    const queue2 = fileQueueService.create('queue2');
    fileQueueService.create('queue3');

    assert.strictEqual(fileQueueService.files.length, 0);
    assert.strictEqual(fileQueueService.size, 0);
    assert.strictEqual(fileQueueService.loaded, 0);
    assert.strictEqual(fileQueueService.progress, 0);

    const file = new File(png, 'test-filename.jpg');

    const uploadFile1 = new UploadFile(file, FileSource.Browse);
    queue1.add(uploadFile1);

    assert.strictEqual(fileQueueService.files.length, 1);
    assert.strictEqual(fileQueueService.size, 82);
    assert.strictEqual(fileQueueService.loaded, 0);
    assert.strictEqual(fileQueueService.progress, 0);

    const uploadFile2 = new UploadFile(file, FileSource.Browse);
    queue2.add(uploadFile2);

    assert.strictEqual(fileQueueService.files.length, 2);
    assert.strictEqual(fileQueueService.size, 164);
    assert.strictEqual(fileQueueService.loaded, 0);
    assert.strictEqual(fileQueueService.progress, 0);

    const uploadFile3 = new UploadFile(file, FileSource.Browse);
    queue2.add(uploadFile3);

    assert.strictEqual(fileQueueService.files.length, 3);
    assert.strictEqual(fileQueueService.size, 246);
    assert.strictEqual(fileQueueService.loaded, 0);
    assert.strictEqual(fileQueueService.progress, 0);
  });

  test('the uploaded size of the queue is the aggregate of all queues', function (this: TestContext, assert) {
    const fileQueueService = this.owner.lookup('service:file-queue');
    const queue1 = fileQueueService.create('queue1');

    assert.strictEqual(fileQueueService.files.length, 0);
    assert.strictEqual(fileQueueService.size, 0);
    assert.strictEqual(fileQueueService.loaded, 0);
    assert.strictEqual(fileQueueService.progress, 0);

    const file = new File(png, 'test-filename.jpg');
    const uploadFile1 = new UploadFile(file, FileSource.Browse);
    uploadFile1.loaded = 21;

    queue1.add(uploadFile1);

    assert.strictEqual(fileQueueService.files.length, 1);
    assert.strictEqual(fileQueueService.size, 82);
    assert.strictEqual(fileQueueService.loaded, 21);
    assert.strictEqual(fileQueueService.progress, 25);

    const queue2 = fileQueueService.create('queue2');
    const uploadFile2 = new UploadFile(file, FileSource.Browse);
    uploadFile2.loaded = 14;

    queue2.add(uploadFile2);

    assert.strictEqual(fileQueueService.files.length, 2);
    assert.strictEqual(fileQueueService.size, 164);
    assert.strictEqual(fileQueueService.loaded, 35);
    assert.strictEqual(fileQueueService.progress, 21);

    fileQueueService.create('queue3');

    const uploadFile3 = new UploadFile(file, FileSource.Browse);
    uploadFile3.loaded = 70;

    queue2.add(uploadFile3);

    assert.strictEqual(fileQueueService.files.length, 3);
    assert.strictEqual(fileQueueService.size, 246);
    assert.strictEqual(fileQueueService.loaded, 105);
    assert.strictEqual(fileQueueService.progress, 42);
  });

  test('the queue is emptied when all files are completed and flush is called', function (this: TestContext, assert) {
    const fileQueueService = this.owner.lookup('service:file-queue');
    const queue = fileQueueService.create('queue');

    const file = new File(png, 'test-filename.jpg');
    const file0 = new UploadFile(file, FileSource.Browse);
    file0.state = FileState.Queued;

    queue.add(file0);

    assert.strictEqual(fileQueueService.files.length, 1);

    const file1 = new UploadFile(file, FileSource.Browse);
    file1.state = FileState.Queued;

    queue.add(file1);

    assert.strictEqual(fileQueueService.files.length, 2);

    const file2 = new UploadFile(file, FileSource.Browse);
    file2.state = FileState.Uploaded;

    queue.add(file2);

    assert.strictEqual(fileQueueService.files.length, 3);

    file0.state = FileState.Aborted;

    assert.strictEqual(fileQueueService.files.length, 3);

    file1.state = FileState.Aborted;
    queue.flush();

    assert.strictEqual(fileQueueService.files.length, 0);
    assert.strictEqual(queue.files.length, 0);
  });
});
