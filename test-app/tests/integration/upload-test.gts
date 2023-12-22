import { module, test } from 'qunit';
import { findAll } from '@ember/test-helpers';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import { selectFiles } from 'ember-file-upload/test-support';
import {
  type MirageTestContext,
  setupMirage,
} from 'ember-cli-mirage/test-support';
import { TrackedArray } from 'tracked-built-ins';
import DemoUpload, { type Asset } from 'test-app/components/demo-upload';
import getImageBlob from 'test-app/tests/helpers/get-image-blob';

module('Integration | upload', function (hooks) {
  setupRenderingTest(hooks);
  setupMirage(hooks);

  test('upload works for File', async function (this: MirageTestContext, assert) {
    const files: Asset[] = new TrackedArray([]);
    await render(<template><DemoUpload @files={{files}} /></template>);

    const data = await getImageBlob();

    if (data) {
      const photo = new File([data], 'image.png', { type: 'image/png' });
      await selectFiles('#upload-photo', photo);
    }

    const uploadedPhoto = this.server.db.photos[0];
    assert.strictEqual(uploadedPhoto.filename, 'image.png');
    assert.strictEqual(uploadedPhoto.filesize, 1192);
    assert.strictEqual(uploadedPhoto.type, 'image');

    assert.strictEqual(
      findAll('.demo-uploaded-files-list img').length,
      1,
      'Photo is displayed in the UI',
    );
  });

  test('upload works for Blob', async function (this: MirageTestContext, assert) {
    const files: Asset[] = new TrackedArray([]);
    await render(<template><DemoUpload @files={{files}} /></template>);

    const photo = await getImageBlob();

    if (photo) {
      await selectFiles('#upload-photo', photo);
    }

    const uploadedPhoto = this.server.db.photos[0];
    assert.strictEqual(uploadedPhoto.filename, 'blob');
    assert.strictEqual(uploadedPhoto.filesize, 1192);
    assert.strictEqual(uploadedPhoto.type, 'image');

    assert.strictEqual(
      findAll('.demo-uploaded-files-list img').length,
      1,
      'Photo is displayed in the UI',
    );
  });
});
