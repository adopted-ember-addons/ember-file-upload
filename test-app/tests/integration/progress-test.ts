import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { selectFiles } from 'ember-file-upload/test-support';
import { type MirageTestContext, setupMirage } from 'ember-cli-mirage/test-support';
import { TrackedArray } from 'tracked-built-ins';
import { type Asset } from 'test-app/components/demo-upload';
import type Owner from '@ember/owner';
import getImageBlob from 'test-app/tests/helpers/get-image-blob';

interface LocalTestContext extends MirageTestContext {
  files: TrackedArray<Asset>;
  uploadSucceeded: () => void;
  owner: Owner;
}

class FileTracker {
  isCompleted = false;
  onComplete = () => {};
  promise = new Promise<void>((resolve) => {
    this.onComplete = () => {
      this.isCompleted = true;
      resolve();
    };
  });
}

module('Integration | progress', function (hooks) {
  setupRenderingTest(hooks);
  setupMirage(hooks);

  test('regression: uploading files in sequence', async function (this: LocalTestContext, assert) {
    this.files = new TrackedArray([]);
    const queue = this.owner
      .lookup('service:file-queue')
      .findOrCreate('photos');

    const [firstFile, secondFile, thirdFile] = [
      new FileTracker(),
      new FileTracker(),
      new FileTracker(),
    ];
    this.uploadSucceeded = () => {
      for (const file of [firstFile, secondFile, thirdFile]) {
        if (file.isCompleted) continue;

        file.onComplete();
        break;
      }
    };

    await render<LocalTestContext>(
      hbs`<DemoUpload
        @files={{this.files}}
        @onUploadSucceeded={{this.uploadSucceeded}}
      />`,
    );

    const data = await getImageBlob();

    if (data) {
      const file = new File([data], 'image.png', { type: 'image/png' });
      // Upload files but don't allow the test runner to wait for settled()
      // so that we can assert partial upload state using FileTracker
      selectFiles('#upload-photo', file, file, file);
    }

    await firstFile.promise;

    assert.strictEqual(
      queue.progress,
      33,
      'first file uploaded - queue progress 33%',
    );
    assert.strictEqual(
      queue.files.length,
      3,
      'first file uploaded - 3 files in queue',
    );

    await secondFile.promise;

    assert.strictEqual(
      queue.progress,
      66,
      'second file uploaded - queue progress 66%',
    );
    assert.strictEqual(
      queue.files.length,
      3,
      'second file uploaded - 3 files in queue',
    );

    await thirdFile.promise;

    assert.strictEqual(
      queue.progress,
      0,
      'third file uploaded - progress is back to 0% since the queue has been flushed',
    );
    assert.strictEqual(
      queue.files.length,
      0,
      'third file uploaded - queue is empty',
    );
  });
});
