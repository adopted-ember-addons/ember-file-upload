import DataTransferWrapper from 'ember-file-upload/system/data-transfer-wrapper';
import { module, test } from 'qunit';

module('data-transfer-wrapper', function (hooks) {
  hooks.beforeEach(function () {
    this.subject = new DataTransferWrapper({});
  });

  hooks.afterEach(function () {
    this.subject = null;
  });

  test('with no native dataTransfer', function (assert) {
    assert.deepEqual(this.subject.files, []);
  });

  test('a single item being dragged', function (assert) {
    this.subject.dataTransfer = {
      items: [
        {
          type: 'image/jpeg',
        },
      ],
    };
    assert.strictEqual(this.subject.filesOrItems.length, 1);
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
    assert.strictEqual(this.subject.filesOrItems.length, 1);
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
    assert.strictEqual(this.subject.filesOrItems.length, 2);
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
    assert.strictEqual(this.subject.filesOrItems.length, 2);
  });
});
