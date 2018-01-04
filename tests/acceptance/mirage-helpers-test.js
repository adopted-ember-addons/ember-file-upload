import { test } from 'qunit';
import moduleForAcceptance from '../../tests/helpers/module-for-acceptance';
import { upload } from '../helpers/upload';
import { dataUrlToBlob } from "ember-file-upload/file";

moduleForAcceptance('Acceptance | mirage helpers');

test('upload a photo', async function(assert) {
  await visit('/');

  let blob = dataUrlToBlob('data:image/gif;base64,R0lGODdhCgAKAIAAAAEBAf///ywAAAAACgAKAAACEoyPBhp7vlySqVVFL8oWg89VBQA7');
  let file = new File([ blob ], 'smile.gif');

  await upload('#upload-photo', file);

  let photo = server.db.photos[0];
  assert.ok(photo);
  assert.equal(photo.filename, 'smile.gif');
});
