import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import { uploadHandler } from 'ember-file-upload';
import { UploadFile, FileSource } from 'ember-file-upload';

import {
  type MirageTestContext,
  setupMirage,
} from 'ember-cli-mirage/test-support';

module('Unit | UploadFile', function (hooks) {
  setupTest(hooks);
  setupMirage(hooks);

  test('it can upload without a `queue`', async function (this: MirageTestContext, assert) {
    this.server.post(
      '/image',
      uploadHandler((_schema, request) => {
        assert.deepEqual(
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          request.requestBody.file,
          {
            name: 'blob',
            size: 12,
            type: 'text',
            url: 'data:text;base64,TXkgVGVzdCBGaWxl',
            hasAdditionalMetadata: false,
            extension: undefined,
          },
          'Successfully uploaded the file',
        );
      }),
    );

    const file = UploadFile.fromBlob(
      new Blob(['My Test File'], { type: 'text' }),
    );

    await file.upload('/image');
  });

  test('it does not mutate the provided options', async function (this: MirageTestContext, assert) {
     
    this.server.post('/image', function () {});

    const file = UploadFile.fromBlob(
      new Blob(['My Test File'], { type: 'text' }),
    );

    const options = {
      accepts: ['foo'],
      data: {
        bar: 'bar',
      },
      headers: {
        baz: 'baz',
      },
    };

    await file.upload('/image', options);

    assert.deepEqual(options, {
      accepts: ['foo'],
      data: {
        bar: 'bar',
      },
      headers: {
        baz: 'baz',
      },
    });
  });

  test('it allows name to be set', function (assert) {
    const file = new UploadFile(new File([], 'dingus.txt'), FileSource.Browse);
    assert.strictEqual(file.name, 'dingus.txt');
    file.name = 'dangus.txt';
    assert.strictEqual(file.name, 'dangus.txt');
  });

  test('it reads the size and allows it to be set', function (assert) {
    const file = UploadFile.fromBlob(new Blob(['test text'], { type: 'text' }));
    assert.strictEqual(file.size, 9);
    assert.strictEqual(file.file.size, 9);
    file.size = 13;
    assert.strictEqual(file.size, 13);
    assert.strictEqual(file.file.size, 9);
  });
});
