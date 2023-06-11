import FakeXMLHttpRequest from 'fake-xml-http-request';
import { HTTPRequest } from 'ember-file-upload/internal';
import { module, test, skip } from 'qunit';

module('Unit | HttpRequest', function (hooks) {
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
    this.subject = new HTTPRequest();
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
    assert.expect(4);
    this.subject.open('PUT', 'http://emberjs.com');
    let promise = this.subject
      .send({
        filename: 'rfc.md',
      })
      .then(function (response) {
        assert.deepEqual(
          Array.from(response.headers.entries()),
          [['content-type', 'text/plain']],
          'headers match'
        );
        assert.strictEqual(response.status, 200, 'status is 200');
        return response.text();
      })
      .then((responeText) => {
        assert.strictEqual(responeText, 'ok', 'response text matches');
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
        assert.deepEqual(
          Array.from(response.headers.entries()),
          [['content-type', 'text/html']],
          'headers match'
        );
        return response.text();
      })
      .then((html) => {
        assert.strictEqual(html, '<html><body>ok</body></html>');
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
        assert.deepEqual(
          Array.from(response.headers.entries()),
          [['content-type', 'text/xml']],
          'headers match'
        );
        return response.text();
      })
      .then((reponseXml) => {
        assert.strictEqual(reponseXml, xml, 'xml response matches');
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
      assert.expect(4);
      this.subject.open('PUT', 'http://emberjs.com');
      let promise = this.subject
        .send({
          filename: 'rfc.md',
        })
        .then(function (response) {
          assert.deepEqual(
            Array.from(response.headers.entries()),
            [['content-type', contentType]],
            'headers match'
          );
          assert.strictEqual(response.status, 200, 'status is 200');
          return response.json();
        })
        .then((responseJson) => {
          assert.deepEqual(
            responseJson,
            { name: 'rfc.md', size: 1024 },
            'json response matches'
          );
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
    this.subject = new HTTPRequest({ withCredentials: true });
    this.subject.open('POST', 'http://emberjs.com');

    assert.true(this.request.withCredentials);
  });

  test(`confirm withCredentials: false by default`, function (assert) {
    this.subject.open('POST', 'http://emberjs.com');
    assert.false(this.request.withCredentials);
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

  // Check for regression of: https://github.com/adopted-ember-addons/ember-file-upload/issues/809
  test('regression: successful send with a 204 and empty string response body', function (assert) {
    assert.expect(2);
    this.subject.open('PUT', 'http://emberjs.com');
    let promise = this.subject
      .send({
        filename: 'rfc.md',
      })
      .then(function (response) {
        assert.strictEqual(response.status, 204, 'status is 204');
        return response.text();
      })
      .then((responeText) => {
        assert.strictEqual(responeText, '', 'response text matches');
      });

    this.respond(204, { 'Content-Type': 'text/plain' }, '');

    return promise;
  });

  test('it returns an error response if the response status is ouside of the [200, 599] range', function (assert) {
    assert.expect(3);

    this.subject.open('PUT', 'http://emberjs.com');

    this.subject.send({ filename: 'rfc.md' }).catch((response) => {
      assert.strictEqual(response.status, 0, 'response status is 0');
      assert.false(response.ok, 'response is not ok');
      assert.strictEqual(response.type, 'error', 'response type is error');
    });

    this.respond(0, {}, 'timeout');
  });

  skip('onprogress', function () {});

  skip('ontimeout', function () {});

  skip('onabort', function () {});
});
