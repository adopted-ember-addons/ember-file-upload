/* global server, upload */
import File from 'ember-file-upload/file';
import { test } from 'qunit';
import moduleForAcceptance from '../../tests/helpers/module-for-acceptance';
import { upload as uploadRequest } from 'ember-file-upload/mirage';

moduleForAcceptance('Acceptance | file upload');

test('accepts a File from a DataURL', function(assert) {
  server.post('/photos', uploadRequest((_, { requestBody }) => requestBody.file));

  const dataUrl = 'data:image/gif;base64,R0lGODdhCgAKAIAAAAEBAf///ywAAAAACgAKAAACEoyPBhp7vlySqVVFL8oWg89VBQA7';
  const file = File.fromDataURL(dataUrl);

  visit('/example');
  upload('#upload-image input[type="file"]', file, 'smile.gif');

  andThen(() => {
    assert.equal(findWithAssert('#the-image').attr('src'), dataUrl);
  });
});
