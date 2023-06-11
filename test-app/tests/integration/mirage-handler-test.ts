import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import { uploadHandler } from 'ember-file-upload';
import { selectFiles } from 'ember-file-upload/test-support';
import {
  animatedGif,
  staticGif,
  mp4,
  ogg,
  png,
} from 'test-app/tests/utils/file-data';
import { MirageTestContext, setupMirage } from 'ember-cli-mirage/test-support';
import type { UploadFile } from 'ember-file-upload';

interface LocalTestContext extends MirageTestContext {
  fileAdded: (file: UploadFile) => void;
}

module('Integration | Component | mirage-handler', function (hooks) {
  setupRenderingTest(hooks);
  setupMirage(hooks);

  test('upload handler passes schema and request through providing additional file metadata as request body', async function (this: LocalTestContext, assert) {
    assert.expect(6);
    this.server.post(
      '/folder/:id/file',
      uploadHandler((schema, request) => {
        assert.step('mirage-handler');

        assert.strictEqual(schema, this.server.schema, 'schema is provided');
        assert.strictEqual(
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          typeof request.params,
          'object',
          'params property on request is an object'
        );
        assert.strictEqual(
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          request.params.id,
          '1',
          'value of dynamic segment is present on params object'
        );
        assert.deepEqual(request.requestBody, {
          'Content-Type': 'text/plain',
          file: {
            extension: 'txt',
            hasAdditionalMetadata: false,
            name: 'text.txt',
            size: 9,
            type: 'text/plain',
            url: 'data:text/plain;base64,c29tZS1kYXRh',
          },
        });
      })
    );

    this.fileAdded = (file) => file.upload('/folder/1/file');
    await render(hbs`
      {{#let (file-queue name="test" onFileAdded=this.fileAdded) as |queue|}}
        <label>
          <input type="file" {{queue.selectFile}} />
        </label>
      {{/let}}
    `);

    const file = new File(['some-data'], 'text.txt', { type: 'text/plain' });
    await selectFiles('input', file);

    assert.verifySteps(['mirage-handler']);
  });

  module('metadata', function () {
    const VALID_SCENARIOS = {
      staticGif: {
        file: new File(staticGif, 'image.gif', {
          type: 'image/gif',
        }),
        additionalMetadata: {
          width: 1,
          height: 1,
          duration: 0,
          animated: false,
        },
      },
      animatedGif: {
        file: new File(animatedGif, 'image.gif', {
          type: 'image/gif',
        }),
        additionalMetadata: {
          width: 1,
          height: 1,
          duration: 0.04,
          animated: true,
        },
      },

      image: {
        file: new File(png, 'image.png', {
          type: 'image/png',
        }),
        additionalMetadata: {
          width: 1,
          height: 1,
        },
      },
      audio: {
        file: new File(ogg, 'audio.ogg', {
          type: 'audio/ogg',
        }),
        additionalMetadata: {
          duration: 1,
        },
      },
      video: {
        file: new File(mp4, 'video.mp4', {
          type: 'video/mp4',
        }),
        additionalMetadata: {
          duration: 1,
          height: 8,
          width: 8,
        },
      },
    };

    for (const [type, scenario] of Object.entries(VALID_SCENARIOS)) {
      test(`${type}: upload handler resolves with hasAdditionalMetadata: true when additional metadata can be extracted`, async function (this: LocalTestContext, assert) {
        assert.expect(2);

        this.server.post(
          '/upload-file',
          uploadHandler((_schema, request) => {
            assert.true(
              // eslint-disable-next-line @typescript-eslint/ban-ts-comment
              // @ts-ignore
              request.requestBody.file.hasAdditionalMetadata,
              'has additional metadata'
            );
            assert.propContains(
              // eslint-disable-next-line @typescript-eslint/ban-ts-comment
              // @ts-ignore
              request.requestBody.file,
              scenario.additionalMetadata,
              'additional metadata extracted'
            );
          })
        );

        this.fileAdded = (file) => {
          return file.upload('/upload-file');
        };
        await render(hbs`
          {{#let (file-queue name="test" onFileAdded=this.fileAdded) as |queue|}}
            <label>
              <input type="file" {{queue.selectFile}} />
            </label>
          {{/let}}
        `);

        await selectFiles('input', scenario.file);
      });
    }

    const INVALID_SCENARIOS = {
      audio: new File(['invalid-data-for-audio'], 'audio.mp3', {
        type: 'audio/mpeg',
      }),
      image: new File(['invalid-data-for-image'], 'image.png', {
        type: 'image/png',
      }),
      video: new File(['invalid-data-for-video'], 'video.webm', {
        type: 'video/webm',
      }),
    };
    for (const [type, file] of Object.entries(INVALID_SCENARIOS)) {
      test(`${type}: upload handler resolves with hasAdditionalMetadata: false when additional metadata cannot be extracted`, async function (this: LocalTestContext, assert) {
        assert.expect(1);

        this.server.post(
          '/upload-file',
          uploadHandler((_schema, request) =>
            assert.false(
              // eslint-disable-next-line @typescript-eslint/ban-ts-comment
              // @ts-ignore
              request.requestBody.file.hasAdditionalMetadata,
              'does not have additional metadata'
            )
          )
        );

        this.fileAdded = (file) => {
          return file.upload('/upload-file');
        };
        await render(hbs`
          {{#let (file-queue name="test" onFileAdded=this.fileAdded) as |queue|}}
            <label>
              <input type="file" {{queue.selectFile}} />
            </label>
          {{/let}}
        `);

        await selectFiles('input', file);
      });
    }
  });
});
