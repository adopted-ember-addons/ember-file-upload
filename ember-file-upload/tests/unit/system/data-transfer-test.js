import DataTransfer from 'ember-file-upload/system/data-transfer';
import { module, test } from 'qunit';

module('data-transfer', function (hooks) {
  hooks.beforeEach(function () {
    this.subject = new DataTransfer({});
  });

  hooks.afterEach(function () {
    this.subject = null;
  });

  test('with no native dataTransfer', function (assert) {
    assert.strictEqual(this.subject.files, null);
  });

  test('a single item being dragged', function (assert) {
    this.subject.dataTransfer = {
      items: [
        {
          type: 'image/jpeg',
        },
      ],
    };
    assert.strictEqual(this.subject.files.length, 1);
  });

  test('a single file being dropped', function (assert) {
    this.subject.dataTransfer = {
      files: [
        {
          name: 'tomster.jpg',
          type: 'image/jpeg',
        },
      ],
    };
    assert.strictEqual(this.subject.files.length, 1);
  });

  test('multiple items being dragged', function (assert) {
    this.subject.dataTransfer = {
      items: [
        {
          type: 'image/jpeg',
        },
        {
          type: 'image/png',
        },
      ],
    };
    assert.strictEqual(this.subject.files.length, 2);
  });

  test('multiple files being dropped', function (assert) {
    this.subject.dataTransfer = {
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
    };
    assert.strictEqual(this.subject.files.length, 2);
  });
});
