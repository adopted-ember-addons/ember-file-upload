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

  test('multiple=false; a single item being dragged', function (assert) {
    this.subject.dataTransfer = {
      items: [
        {
          type: 'image/jpeg',
        },
      ],
    };
    assert.strictEqual(this.subject.files.length, 1);
  });

  test('multiple=false; a single file being dropped', function (assert) {
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

  test('multiple=false; multiple items being dragged', function (assert) {
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
    assert.strictEqual(this.subject.files.length, 1);
  });

  test('multiple=false; multiple files being dropped', function (assert) {
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
    assert.strictEqual(this.subject.files.length, 1);
  });

  test('multiple=true; a single item being dragged', function (assert) {
    this.subject.dataTransfer = {
      items: [
        {
          type: 'image/jpeg',
        },
      ],
    };
    this.subject.queue = { multiple: true };
    assert.strictEqual(this.subject.files.length, 1);
  });

  test('multiple=true; a single file being dropped', function (assert) {
    this.subject.dataTransfer = {
      files: [
        {
          name: 'tomster.jpg',
          type: 'image/jpeg',
        },
      ],
    };
    this.subject.queue = { multiple: true };
    assert.strictEqual(this.subject.files.length, 1);
  });

  test('multiple=true; multiple items being dragged', function (assert) {
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
    this.subject.queue = { multiple: true };
    assert.strictEqual(this.subject.files.length, 2);
  });

  test('multiple=true; multiple files being dropped', function (assert) {
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
    this.subject.queue = { multiple: true };
    assert.strictEqual(this.subject.files.length, 2);
  });
});
