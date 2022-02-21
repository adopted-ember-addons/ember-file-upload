import FakeXMLHttpRequest from 'fake-xml-http-request';
import HttpRequest from 'ember-file-upload/system/http-request';
import { module, test, skip } from 'qunit';

module('http-request', function (hooks) {
  hooks.beforeEach(function () {
    this._XMLHttpRequest = window.XMLHttpRequest;
    let test = this;
    window.XMLHttpRequest = function () {
      let request = new FakeXMLHttpRequest();
      test.request = request;
      test.respond = function (...args) {
        request.respond(...args);
      };
      return request;
    };
    this.subject = new HttpRequest();
  });

  hooks.afterEach(function () {
    this.subject = null;
    window.XMLHttpRequest = this._XMLHttpRequest;
  });

  test('open with default options', function (assert) {
    assert.strictEqual(this.request.readyState, FakeXMLHttpRequest.UNSENT);
    this.subject.open('POST', 'http://emberjs.com');

    assert.strictEqual(this.request.readyState, FakeXMLHttpRequest.OPENED);
    assert.strictEqual(this.request.method, 'POST');
    assert.strictEqual(this.request.url, 'http://emberjs.com');
  });

  test('open ignores the async option', function (assert) {
    this.subject.open('POST', 'http://emberjs.com', false);
    assert.true(this.request.async);
  });

  test('open allows username / password', function (assert) {
    this.subject.open('POST', 'http://emberjs.com', true, 'tomster', 'ember');
    assert.strictEqual(this.request.username, 'tomster');
    assert.strictEqual(this.request.password, 'ember');
  });

  test('setRequestHeader', function (assert) {
    this.subject.open();
    this.subject.setRequestHeader('Content-Type', 'application/json');

    assert.strictEqual(
      this.request.requestHeaders['Content-Type'],
      'application/json'
    );
  });

  test('successful send with a text/plain response', function (assert) {
    assert.expect(2);
    this.subject.open('PUT', 'http://emberjs.com');
    let promise = this.subject
      .send({
        filename: 'rfc.md',
      })
      .then(function (response) {
        assert.deepEqual(response, {
          body: 'ok',
          headers: {
            'Content-Type': 'text/plain',
          },
          status: 200,
        });
      });

    assert.deepEqual(this.request.requestBody, {
      filename: 'rfc.md',
    });

    this.respond(200, { 'Content-Type': 'text/plain' }, 'ok');

    return promise;
  });

  test('successful send with a text/html response', function (assert) {
    assert.expect(3);
    this.subject.open('PUT', 'http://emberjs.com');
    let promise = this.subject
      .send({
        filename: 'rfc.md',
      })
      .then(function (response) {
        assert.deepEqual(response.headers, {
          'Content-Type': 'text/html',
        });
        assert.strictEqual(response.body[0].textContent, 'ok');
      });

    assert.deepEqual(this.request.requestBody, {
      filename: 'rfc.md',
    });

    this.respond(
      200,
      { 'Content-Type': 'text/html' },
      '<html><body>ok</body></html>'
    );

    return promise;
  });

  test('successful send with a text/xml response', function (assert) {
    assert.expect(3);
    let xml =
      '<message from="zoey@emberjs.com" to="tomster@emberjs.com"><file name="rfc.md" size="1024"/></message>';

    this.subject.open('PUT', 'http://emberjs.com');
    let promise = this.subject
      .send({
        filename: 'rfc.md',
      })
      .then(function (response) {
        assert.deepEqual(response.headers, {
          'Content-Type': 'text/xml',
        });
        assert.strictEqual(
          new window.XMLSerializer().serializeToString(response.body),
          xml
        );
      });

    assert.deepEqual(this.request.requestBody, {
      filename: 'rfc.md',
    });

    this.respond(200, { 'Content-Type': 'text/xml' }, xml);

    return promise;
  });

  [
    'application/json',
    'application/vnd.api+json',
    'text/javascript',
    'application/javascript',
  ].forEach(function (contentType) {
    test(`successful send with a ${contentType} response`, function (assert) {
      assert.expect(2);
      this.subject.open('PUT', 'http://emberjs.com');
      let promise = this.subject
        .send({
          filename: 'rfc.md',
        })
        .then(function (response) {
          assert.deepEqual(response, {
            body: {
              name: 'rfc.md',
              size: 1024,
            },
            headers: {
              'Content-Type': contentType,
            },
            status: 200,
          });
        });

      assert.deepEqual(this.request.requestBody, {
        filename: 'rfc.md',
      });

      this.respond(
        200,
        { 'Content-Type': contentType },
        JSON.stringify({
          name: 'rfc.md',
          size: 1024,
        })
      );

      return promise;
    });
  });

  test(`succesful open with 'withCredentials: true'`, function (assert) {
    this.subject = new HttpRequest({ withCredentials: true });
    this.subject.open('POST', 'http://emberjs.com');

    assert.true(this.request.withCredentials);
  });

  test(`confirm withCredentials: undefined by default`, function (assert) {
    this.subject.open('POST', 'http://emberjs.com');
    assert.strictEqual(this.request.withCredentials, undefined);
  });

  test('promise is cancellable', function (assert) {
    this.subject.open('PUT', 'http://emberjs.com');
    let promise = this.subject.send();
    assert.strictEqual(
      typeof promise.cancel,
      'function',
      'returned promise should have a cancel() method'
    );

    let promise2 = promise
      .then(function () {})
      .catch(function () {})
      .finally(function () {});

    assert.strictEqual(
      typeof promise2.cancel,
      'function',
      'chained promise should have a cancel() method'
    );
  });

  skip('onprogress', function () {});

  skip('ontimeout', function () {});

  skip('onabort', function () {});
});
