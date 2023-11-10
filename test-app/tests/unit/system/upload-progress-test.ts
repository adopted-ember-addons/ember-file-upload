/* eslint-disable qunit/no-conditional-assertions */

import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import { FileSource, UploadFile } from 'ember-file-upload';
import { type TestContext } from '@ember/test-helpers';
import { png } from 'test-app/tests/utils/file-data';
import { onloadstart, onprogress, onloadend } from 'ember-file-upload/internal';

interface Handlers {
  [key: string]: typeof onloadstart;
}

const handlers: Handlers = {
  loadstart: onloadstart,
  progress: onprogress,
  loadend: onloadend,
};

type Step = {
  assertProgressBefore?: number;
  event: ProgressEvent;
  assertProgressAfter?: number;
};

const replayEvents = (
  assert: Assert,
  uploadFile: UploadFile,
  steps: Step[],
) => {
  for (const step of steps) {
    if (typeof step.assertProgressBefore === 'number') {
      assert.strictEqual(
        uploadFile.progress,
        step.assertProgressBefore,
        `before (index: ${steps.indexOf(step)}), progress is: ${
          step.assertProgressBefore
        }% type: ${step.event.type}, total: ${step.event.total}, loaded: ${
          step.event.loaded
        }`,
      );
    }

    const handler = handlers[step.event.type];
    if (!handler) throw new Error(`No handler matched ${step.event.type}`);

    handler(uploadFile, step.event);

    if (typeof step.assertProgressAfter === 'number') {
      assert.strictEqual(
        uploadFile.progress,
        step.assertProgressAfter,
        `after (index: ${steps.indexOf(step)}), progress is: ${
          step.assertProgressAfter
        }% type: ${step.event.type}, total: ${step.event.total}, loaded: ${
          step.event.loaded
        }`,
      );
    }
  }
};

module('Unit | upload progress', function (hooks) {
  setupTest(hooks);

  test('Original (from issue #1002)', function (this: TestContext, assert) {
    const uploadFile = new UploadFile(
      new File(png, 'test-filename.png'),
      FileSource.Browse,
    );

    const steps = [
      {
        assertProgressBefore: 0,
        event: new ProgressEvent('progress', {
          lengthComputable: true,
          loaded: 248723,
          total: 248723,
        }),
        assertProgressAfter: 100,
      },
      {
        assertProgressBefore: 100,
        event: new ProgressEvent('loadend', {
          lengthComputable: true,
          loaded: 248723,
          total: 248723,
        }),
        assertProgressAfter: 100,
      },
      {
        assertProgressBefore: 100,
        event: new ProgressEvent('progress', {
          lengthComputable: true,
          loaded: 390,
          total: 390,
        }),
        assertProgressAfter: 100,
      },
      {
        assertProgressBefore: 100,
        event: new ProgressEvent('loadend', {
          lengthComputable: true,
          loaded: 390,
          total: 390,
        }),
        assertProgressAfter: 100,
      },
    ];

    replayEvents(assert, uploadFile, steps);
  });

  test('Chrome (from issue #1002)', function (this: TestContext, assert) {
    const uploadFile = new UploadFile(
      new File(png, 'test-filename.png'),
      FileSource.Browse,
    );

    const steps = [
      {
        assertProgressBefore: 0,
        event: new ProgressEvent('loadstart', {
          lengthComputable: true,
          loaded: 0,
          total: 0,
        }),
      },
      {
        event: new ProgressEvent('loadstart', {
          lengthComputable: true,
          loaded: 0,
          total: 712,
        }),
      },
      {
        assertProgressBefore: 0,
        event: new ProgressEvent('progress', {
          lengthComputable: true,
          loaded: 16384,
          total: 618122,
        }),
        assertProgressAfter: 2.6506094266180464,
      },
      {
        event: new ProgressEvent('progress', {
          lengthComputable: true,
          loaded: 32768,
          total: 618122,
        }),
        assertProgressAfter: 5.301218853236093,
      },
    ];

    replayEvents(assert, uploadFile, steps);
  });

  test('Firefox (from issue #1002)', function (this: TestContext, assert) {
    const uploadFile = new UploadFile(
      new File(png, 'test-filename.png'),
      FileSource.Browse,
    );

    const steps = [
      {
        assertProgressBefore: 0,
        event: new ProgressEvent('loadstart', {
          lengthComputable: true,
          loaded: 0,
          total: 0,
        }),
      },
      {
        event: new ProgressEvent('loadstart', {
          lengthComputable: true,
          loaded: 0,
          total: 618220,
        }),
        assertProgressAfter: 0,
      },
      {
        assertProgressBefore: 0,
        event: new ProgressEvent('progress', {
          lengthComputable: true,
          loaded: 30954,
          total: 618220,
        }),
        assertProgressAfter: 5.0069554527514475,
      },
      {
        event: new ProgressEvent('progress', {
          lengthComputable: true,
          loaded: 62954,
          total: 618220,
        }),
        assertProgressAfter: 10.18310633754974,
      },
    ];

    replayEvents(assert, uploadFile, steps);
  });
});
