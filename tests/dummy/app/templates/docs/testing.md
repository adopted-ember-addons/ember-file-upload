# Acceptance Tests

`ember-file-upload` provides a `selectFiles` helper for acceptance and integration tests:

```javascript
import { selectFiles } from 'ember-file-upload/test-support';
import { module } from 'qunit';
import { setupApplicationTest } from 'ember-qunit';

module('/notes', function(hooks) {
  setupApplicationTest(hooks);

  test('showing a note', async function (assert) {
    let file = new File(['I can feel the money leaving my body'], 'douglas_coupland.txt', { type: 'text/plain' });
    await selectFiles('#upload-note', file);

    assert.dom('.note').hasText('I can feel the money leaving my body');
  });
});
```

It also integrates with `ember-cli-mirage` through an upload handler. This helper provides a way to realistically simulate file uploads, including progress events and failure states.

```javascript
// mirage/config.js

import { upload } from 'ember-file-upload/mirage';

export default function () {
  this.post('/photos/new', upload(function (schema, request) {
    let { name: filename, size: filesize, url } = request.requestBody.file;
    let photo = schema.create('photo', { filename, filesize, url, uploadedAt: new Date() });
    return photo;
  }));
}
```

```javascript
import { module, test } from 'qunit';
import { setupApplicationTest } from 'ember-qunit';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { selectFiles } from 'ember-file-upload/test-support';

module('/photos', function(hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);

  test('uploading an image', async function (assert) {
    let data = new Uint8Array([
      137,80,78,71,13,10,26,10,0,0,0,13,73,72,68,82,0,0,0,8,0,0,
      0,8,8,2,0,0,0,75,109,41,220,0,0,0,34,73,68,65,84,8,215,99,120,
      173,168,135,21,49,0,241,255,15,90,104,8,33,129,83,7,97,163,136,
      214,129,93,2,43,2,0,181,31,90,179,225,252,176,37,0,0,0,0,73,69,
      78,68,174,66,96,130
    ]);
    let file = new File(data, 'smile.png', { type: 'image/png' });
    await selectFiles('#upload-photo', file);

    let photo = server.db.photos[0];
    assert.equal(photo.filename, 'smile.png');
  });
});
```

The upload handler only works with valid images. You could create dummy images for tests using a `canvas` element:

```javascript
function getImageBlob() {
  return new Promise((resolve) => {
    let canvas = document.createElement('canvas');
    canvas.toBlob(resolve, 'image/png');
  });
}
```
