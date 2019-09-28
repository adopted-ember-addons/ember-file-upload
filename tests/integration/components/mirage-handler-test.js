import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import { upload as uploadHandler } from 'ember-file-upload/mirage';
import { upload } from 'ember-file-upload/test-support';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';

module('Integration | Component | mirage-handler', function(hooks) {
  setupRenderingTest(hooks);
  setupMirage(hooks);

  test('upload handler passed schema and request.params throw', async function(assert) {
    let self = this;
    this.server.post('/folder/:id/file', uploadHandler(function(schema, request) {
      assert.step('mirage-handler');

      assert.equal(schema, self.server.schema, 'schema is provided');
      assert.ok(typeof request.params === 'object', 'params property on request is an object');
      assert.equal(request.params.id, '1', 'value of dynamic segment is present on params object');
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
});
