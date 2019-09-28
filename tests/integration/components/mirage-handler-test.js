import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, resetOnerror, setupOnerror } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import { upload as uploadHandler } from 'ember-file-upload/mirage';
import { upload } from 'ember-file-upload/test-support';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';

module('Integration | Component | mirage-handler', function(hooks) {
  setupRenderingTest(hooks);
  setupMirage(hooks);

  hooks.afterEach(function() {
    resetOnerror();
  });

  test('upload handler passes schema and request through providing additional file metadata as request body', async function(assert) {
    let self = this;
    this.server.post('/folder/:id/file', uploadHandler(function(schema, request) {
      assert.step('mirage-handler');

      assert.equal(schema, self.server.schema, 'schema is provided');
      assert.ok(typeof request.params === 'object', 'params property on request is an object');
      assert.equal(request.params.id, '1', 'value of dynamic segment is present on params object');
      assert.deepEqual(request.requestBody, {
        'Content-Type': 'text/plain',
        file: {
          extension: 'txt',
          name: 'text.txt',
          size: 9,
          type: 'text/plain',
          url: 'data:text/plain;base64,c29tZS1kYXRh'
        }
      });
    }));

    this.set('uploadImage', (file) => {
      return file.upload('/folder/1/file');
    });
    await render(hbs`
      {{#file-upload
        name="file"
        onfileadd=uploadImage
      }}
        <a class="button">
          Upload file
        </a>
      {{/file-upload}}
    `);

    let file = new File(['some-data'], 'text.txt', { type: 'text/plain' });
    await upload('input', file);

    assert.verifySteps(['mirage-handler']);
  });

  test('upload handler throws if invalid image is provided', async function(assert) {
    let errorCount = 0;
    setupOnerror((error) => {
      // expect two errors:
      // 1. error thrown by our upload handler
      // 2. error thrown by 500 response that includes the first error as body
      if (errorCount === 0) {
        // error thrown by our mirage handler
        assert.step('error thrown');
        assert.ok(error.message.includes('invalid image'));
      } else {
        // error from 500 response
        assert.step('500 response');
        assert.equal(error.status, 500);
        assert.ok(error.body.error.includes('invalid image'));
      }

      errorCount++;
    });

    this.server.post('/image', uploadHandler(() => {}));

    this.set('uploadImage', (file) => {
      return file.upload('/image');
    });
    await render(hbs`
      {{#file-upload
        name="file"
        onfileadd=uploadImage
      }}
        <a class="button">
          Upload file
        </a>
      {{/file-upload}}
    `);

    let file = new File(['invalid-data-for-an-image'], 'image.png', { type: 'image/png' });
    await upload('input', file);

    assert.verifySteps(['error thrown', '500 response']);
  });
});
