import { module, test } from 'qunit';
import { findAll } from '@ember/test-helpers';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { selectFiles } from 'ember-file-upload/test-support';
import { A } from '@ember/array';

function getImageBlob() {
  return new Promise((resolve) => {
    let canvas = document.createElement('canvas');
    canvas.toBlob(resolve, 'image/png');
  });
}

module('Integration | upload', function (hooks) {
  setupRenderingTest(hooks);
  setupMirage(hooks);

  test('upload works for File', async function (assert) {
    this.files = A([]);
    await render(hbs`<DemoUpload @files={{this.files}} />`);

    let data = await getImageBlob();
    let photo = new File([data], 'image.png', { type: 'image/png' });
    await selectFiles('#upload-photo', photo);

    let uploadedPhoto = this.server.db.photos[0];
    assert.equal(uploadedPhoto.filename, 'image.png');
    assert.equal(uploadedPhoto.filesize, 1192);
    assert.equal(uploadedPhoto.type, 'image');

    assert.equal(
      findAll('.demo-uploaded-files-list img').length,
      1,
      'Photo is displayed in the UI'
    );
  });

  test('upload works for Blob', async function (assert) {
    this.files = A([]);
    await render(hbs`<DemoUpload @files={{this.files}} />`);

    let photo = await getImageBlob();
    photo.name = 'image.png';

    await selectFiles('#upload-photo', photo);

    let uploadedPhoto = this.server.db.photos[0];
    assert.equal(uploadedPhoto.filename, 'image.png');
    assert.equal(uploadedPhoto.filesize, 1192);
    assert.equal(uploadedPhoto.type, 'image');

    assert.equal(
      findAll('.demo-uploaded-files-list img').length,
      1,
      'Photo is displayed in the UI'
    );
  });
});
