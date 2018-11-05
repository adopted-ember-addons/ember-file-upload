import { module, test } from 'qunit';
import { visit, findAll } from '@ember/test-helpers';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import { setupApplicationTest } from 'ember-qunit';
import { upload } from 'ember-file-upload/test-support';

module('Acceptance | upload', function(hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);

  test('upload works', async function(assert) {
    await visit('/');

    let data = new Uint8Array([
      137,80,78,71,13,10,26,10,0,0,0,13,73,72,68,82,0,0,0,8,0,0,
      0,8,8,2,0,0,0,75,109,41,220,0,0,0,34,73,68,65,84,8,215,99,120,
      173,168,135,21,49,0,241,255,15,90,104,8,33,129,83,7,97,163,136,
      214,129,93,2,43,2,0,181,31,90,179,225,252,176,37,0,0,0,0,73,69,
      78,68,174,66,96,130
    ]);

    let photo = new File([data], 'image.png', { type: 'image/png'});
    await upload('#upload-photo', photo);

    let uploadedPhoto = this.server.db.photos[0];
    assert.equal(uploadedPhoto.filename, 'image.png');
    assert.equal(uploadedPhoto.filesize, 91);
    assert.equal(uploadedPhoto.type, 'image');

    assert.equal(findAll('.demo-uploaded-files-list img').length, 3, 'Photo is displayed in the UI');
  });
});
