import { module, test } from 'qunit';
import { visit, findAll } from '@ember/test-helpers';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import { setupApplicationTest } from 'ember-qunit';
import { selectFiles } from 'ember-file-upload/test-support';

function getImageBlob() {
  return new Promise((resolve) => {
    let canvas = document.createElement('canvas');
    canvas.toBlob(resolve, 'image/png');
  });
}

module('Acceptance | upload', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);

  test('upload works for File', async function (assert) {
    await visit('/');

    let data = await getImageBlob();
    let photo = new File([data], 'image.png', { type: 'image/png' });
    await selectFiles('#upload-photo', photo);

    let uploadedPhoto = this.server.db.photos[0];
    assert.equal(uploadedPhoto.filename, 'image.png');
    assert.equal(uploadedPhoto.filesize, 1179);
    assert.equal(uploadedPhoto.type, 'image');

    assert.equal(
      findAll('.demo-uploaded-files-list img').length,
      3,
      'Photo is displayed in the UI'
    );
  });

  test('upload works for Blob', async function (assert) {
    await visit('/');

    let photo = await getImageBlob();
    photo.name = 'image.png';

    await selectFiles('#upload-photo', photo);

    let uploadedPhoto = this.server.db.photos[0];
    assert.equal(uploadedPhoto.filename, 'image.png');
    assert.equal(uploadedPhoto.filesize, 1179);
    assert.equal(uploadedPhoto.type, 'image');

    assert.equal(
      findAll('.demo-uploaded-files-list img').length,
      3,
      'Photo is displayed in the UI'
    );
  });
});
