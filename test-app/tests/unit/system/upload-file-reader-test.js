import { UploadFileReader } from 'ember-file-upload';
import { module, test } from 'qunit';

const FakeFileReader = {
  trigger: 'onload',
  abort() {
    this.onabort();
  },
  readAsArrayBuffer(blob) {
    setTimeout(() => this[this.trigger](blob), 0);
  },
  readAsDataURL(blob) {
    setTimeout(() => this[this.trigger](blob), 0);
  },
  readAsBinaryString(blob) {
    setTimeout(() => this[this.trigger](blob), 0);
  },
  readAsText(blob) {
    setTimeout(() => this[this.trigger](blob), 0);
  },
};

module('Unit | UploadFileReader', function (hooks) {
  hooks.beforeEach(function () {
    this._FileReader = window.FileReader;
    window.FileReader = function () {
      return FakeFileReader;
    };
    this.subject = new UploadFileReader();
  });

  hooks.afterEach(function () {
    this.subject = null;
    window.FileReader = this._FileReader;
  });

  function testReadAs(name, blob = 'test') {
    test(`readAs${name}`, function (assert) {
      assert.expect(1);
      FakeFileReader.trigger = 'onload';
      FakeFileReader.result = 'ok';

      let promise = this.subject['readAs' + name](blob);
      return promise.then(function (result) {
        assert.strictEqual(result, 'ok');
      });
    });

    test(`readAs${name} errored`, function (assert) {
      assert.expect(1);
      FakeFileReader.trigger = 'onerror';
      FakeFileReader.error = 'not ok';

      let promise = this.subject['readAs' + name](blob);
      return promise.then(null, function (error) {
        assert.strictEqual(error, 'not ok');
      });
    });

    test(`readAs${name} cancelled`, function (assert) {
      assert.expect(1);
      FakeFileReader.trigger = 'onabort';

      let promise = this.subject['readAs' + name](blob);
      return promise.cancel().then(function () {
        assert.ok(true);
      });
    });
  }

  testReadAs('ArrayBuffer');
  testReadAs('DataURL');
  testReadAs('BinaryString');
  testReadAs('Text');
});
