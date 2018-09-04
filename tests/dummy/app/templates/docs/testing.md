# Acceptance Tests

`ember-file-upload` integrates with `ember-cli-mirage` for acceptance tests. This helper provides a way to realistically simulate file uploads, including progress events and failure states. The helper adds another method to the mirage server called `upload`, which will handle upload requests.


`mirage/config.js`
```javascript
import { upload } from 'ember-file-upload/mirage';

export default function () {
  this.post('/photos/new', upload(function (db, request) {
    let { name: filename, size: filesize, url } = request.requestBody.file;
    let photo = db.create('photo', { filename, filesize, url, uploadedAt: new Date() });
    return photo;
  }));
}
```

```javascript
import { upload } from 'ember-file-upload/test-support';
import File from 'ember-file-upload/file';

moduleForAcceptance('/photos');

test('uploading an image', async function (assert) {
  let file = File.fromDataURL('data:image/gif;base64,R0lGODdhCgAKAIAAAAEBAf///ywAAAAACgAKAAACEoyPBhp7vlySqVVFL8oWg89VBQA7');

  await upload('#upload-photo', file, 'smile.gif');

  let photo = server.db.photos[0];
  assert.equal(photo.filename, 'smile.gif');
});
```

If the file isn't uploaded to the server, you don't need to use the mirage helper. The same approach applies to all types of files; encode them as a Base64 data url or read them from a file as a blob.

```javascript
import { upload } from 'ember-file-upload/test-support';

moduleForAcceptance('/notes');

test('showing a note', async function (assert) {
  let file = File.fromDataURL('data:text/plain;base64,SSBjYW4gZmVlbCB0aGUgbW9uZXkgbGVhdmluZyBteSBib2R5');

  await upload('#upload-note', file, 'douglas_coupland.txt');

  assert.equal(find('.note').text(), 'I can feel the money leaving my body');
});
```
