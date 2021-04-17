import DataTransfer from 'ember-file-upload/system/data-transfer';
import { module, test } from 'qunit';

module('data-transfer', function (hooks) {
  hooks.beforeEach(function () {
    this.subject = DataTransfer.create();
  });

  hooks.afterEach(function () {
    this.subject = null;
  });

  test('with no native dataTransfer', function (assert) {
    assert.ok(this.subject.get('valid'));
    assert.equal(this.subject.get('files'), null);
  });

  test('multiple=false; a single item being dragged', function (assert) {
    this.subject.set('dataTransfer', {
      items: [
        {
          type: 'image/jpeg',
        },
      ],
    });
    assert.equal(this.subject.get('files.length'), 1);
    assert.ok(this.subject.get('valid'));
  });

  test('multiple=false; a single file being dropped', function (assert) {
    this.subject.set('dataTransfer', {
      files: [
        {
          name: 'tomster.jpg',
          type: 'image/jpeg',
        },
      ],
    });
    assert.equal(this.subject.get('files.length'), 1);
    assert.ok(this.subject.get('valid'));
  });

  test('multiple=false; multiple items being dragged', function (assert) {
    this.subject.set('dataTransfer', {
      items: [
        {
          type: 'image/jpeg',
        },
        {
          type: 'image/png',
        },
      ],
    });
    assert.equal(this.subject.get('files.length'), 1);
    assert.notOk(this.subject.get('valid'));
  });

  test('multiple=false; multiple files being dropped', function (assert) {
    this.subject.set('dataTransfer', {
      files: [
        {
          name: 'tomster.jpg',
          type: 'image/jpeg',
        },
        {
          name: 'zoey.png',
          type: 'image/png',
        },
      ],
    });
    assert.equal(this.subject.get('files.length'), 1);
    assert.notOk(this.subject.get('valid'));
  });

  test('multiple=true; a single item being dragged', function (assert) {
    this.subject.set('dataTransfer', {
      items: [
        {
          type: 'image/jpeg',
        },
      ],
    });
    this.subject.set('queue', { multiple: true });
    assert.equal(this.subject.get('files.length'), 1);
    assert.ok(this.subject.get('valid'));
  });

  test('multiple=true; a single file being dropped', function (assert) {
    this.subject.set('dataTransfer', {
      files: [
        {
          name: 'tomster.jpg',
          type: 'image/jpeg',
        },
      ],
    });
    this.subject.set('queue', { multiple: true });
    assert.equal(this.subject.get('files.length'), 1);
    assert.ok(this.subject.get('valid'));
  });

  test('multiple=true; multiple items being dragged', function (assert) {
    this.subject.set('dataTransfer', {
      items: [
        {
          type: 'image/jpeg',
        },
        {
          type: 'image/png',
        },
      ],
    });
    this.subject.set('queue', { multiple: true });
    assert.equal(this.subject.get('files.length'), 2);
    assert.ok(this.subject.get('valid'));
  });

  test('multiple=true; multiple files being dropped', function (assert) {
    this.subject.set('dataTransfer', {
      files: [
        {
          name: 'tomster.jpg',
          type: 'image/jpeg',
        },
        {
          name: 'zoey.png',
          type: 'image/png',
        },
      ],
    });
    this.subject.set('queue', { multiple: true });
    assert.equal(this.subject.get('files.length'), 2);
    assert.ok(this.subject.get('valid'));
  });

  test('mime types validation with items being dragged', function (assert) {
    this.subject.set('dataTransfer', {
      items: [
        {
          type: 'image/jpeg',
        },
        {
          type: 'image/png',
        },
        {
          type: 'image/gif',
        },
        {
          type: 'video/mp4',
        },
        {
          type: 'video/avi',
        },
      ],
    });
    this.subject.set('queue', {
      multiple: true,
      accept: 'image/gif, video/*',
    });

    assert.equal(this.subject.get('files.length'), 3);
    assert.deepEqual(this.subject.get('files'), [
      {
        type: 'image/gif',
      },
      {
        type: 'video/mp4',
      },
      {
        type: 'video/avi',
      },
    ]);
    assert.notOk(this.subject.get('valid'));
  });

  test('extension validation with files being dropped', function (assert) {
    this.subject.set('dataTransfer', {
      files: [
        {
          name: 'tomster.jpg',
          type: 'image/jpeg',
        },
        {
          name: 'zoey.png',
          type: 'image/png',
        },
        {
          name: 'pug-life.GIF',
          type: 'image/gif',
        },
        {
          name: 'pug-snoring.mp4',
          type: 'video/mpeg4',
        },
      ],
    });
    this.subject.set('queue', {
      multiple: true,
      accept: '.gif, .mp4',
    });

    assert.equal(this.subject.get('files.length'), 2);
    assert.deepEqual(this.subject.get('files'), [
      {
        name: 'pug-life.GIF',
        type: 'image/gif',
      },
      {
        name: 'pug-snoring.mp4',
        type: 'video/mpeg4',
      },
    ]);
    assert.notOk(this.subject.get('valid'));
  });

  test('less common mime types', function (assert) {
    this.subject.set('dataTransfer', {
      items: [
        {
          type: 'image/jpeg',
        },
        {
          type: 'image/svg+xml',
        },
        {
          type:
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        },
      ],
    });
    this.subject.set('queue', {
      multiple: true,
      accept:
        'image/svg+xml, application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    });

    assert.equal(this.subject.get('files.length'), 2);
    assert.deepEqual(this.subject.get('files'), [
      {
        type: 'image/svg+xml',
      },
      {
        type:
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      },
    ]);
    assert.notOk(this.subject.get('valid'));
  });

  test('mime type case sensitivity', function (assert) {
    this.subject.set('dataTransfer', {
      items: [
        {
          type: 'image/jPeG',
        },
        {
          type: 'VIdeo/mp4',
        },
      ],
    });
    this.subject.set('queue', {
      multiple: true,
      accept: 'image/JpEg, viDEO/mp4',
    });

    assert.equal(this.subject.get('files.length'), 2);
    assert.deepEqual(this.subject.get('files'), [
      {
        type: 'image/jPeG',
      },
      {
        type: 'VIdeo/mp4',
      },
    ]);
    assert.ok(this.subject.get('valid'));
  });
});
