import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import { upload as uploadHandler } from 'ember-file-upload/mirage';
import UploadFile, { FileSource } from 'ember-file-upload/upload-file';

module('Unit | UploadFile', function (hooks) {
  setupTest(hooks);
  setupMirage(hooks);

  test('it can upload without a `queue`', async function (assert) {
    assert.expect(1);

    this.server.post(
      '/image',
      uploadHandler((schema, request) => {
        assert.deepEqual(
          request.requestBody.file,
          {
            name: 'blob',
            size: 12,
            type: 'text',
            url: 'data:text;base64,TXkgVGVzdCBGaWxl',
            extension: undefined,
          },
          'Successfully uploaded the file'
        );
      })
    );

    const file = UploadFile.fromBlob(
      new Blob(['My Test File'], { type: 'text' })
    );

    await file.upload('/image');
  });

  test('it does not mutate the provided options', async function (assert) {
    this.server.post('/image', () => {});

    const file = UploadFile.fromBlob(
      new Blob(['My Test File'], { type: 'text' })
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
});
