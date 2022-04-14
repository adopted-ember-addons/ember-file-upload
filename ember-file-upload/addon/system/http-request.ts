import { bind } from '@ember/runloop';
import RSVP from 'rsvp';
import parseHTML from './parse-html';
import parseXML from './parse-xml';
import parseJSON from './parse-json';
import {
  HTTPRequestOptions,
  HTTPRequestResponse,
} from 'ember-file-upload/interfaces';

function getHeader(headers: HTTPRequestResponse['headers'], header: string) {
  const headerKeys = Object.keys(headers);
  const headerIdx = headerKeys
    .map((key) => key.toLowerCase())
    .indexOf(header.toLowerCase());
  if (headerIdx !== -1) {
    return headers[headerKeys[headerIdx]];
  }
  return null;
}

function parseResponse(request: XMLHttpRequest): HTTPRequestResponse {
  let body: HTTPRequestResponse['body'] = request.responseText.trim();
  const rawHeaders = request
    .getAllResponseHeaders()
    .split(/\n|\r/)
    .filter(function (header) {
      return header !== '';
    });

  const headers = rawHeaders.reduce(function (
    acc: HTTPRequestResponse['headers'],
    header
  ) {
    const parts = header.split(/^([0-9A-Za-z_-]*:)/);
    if (parts.length > 0 && parts[1] && parts[2]) {
      acc[parts[1].slice(0, -1)] = parts[2].trim();
    }
    return acc;
  },
  {});

  const contentType = (getHeader(headers, 'Content-Type') || '').split(';');

  // Parse body according to the Content-Type received by the server
  if (contentType.indexOf('text/html') !== -1) {
    body = parseHTML(body);
  } else if (contentType.indexOf('text/xml') !== -1) {
    body = parseXML(body);
  } else if (
    contentType.indexOf('application/json') !== -1 ||
    contentType.indexOf('application/vnd.api+json') !== -1 ||
    contentType.indexOf('text/javascript') !== -1 ||
    contentType.indexOf('application/javascript') !== -1
  ) {
    body = parseJSON(body);
  }

  return {
    status: request.status,
    body,
    headers,
  };
}

export default class HTTPRequest {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  onprogress: (event?: ProgressEvent<EventTarget>) => void | undefined;
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  ontimeout: (event?: ProgressEvent<EventTarget>) => void | undefined;
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  onabort: (event?: ProgressEvent<EventTarget>) => void | undefined;

  request;
  resolve;
  reject;
  promise: RSVP.Promise<HTTPRequestResponse>;

  constructor(options: HTTPRequestOptions = {}) {
    const { resolve, reject, promise } = RSVP.defer(
      `ember-file-upload: ${options.label}`
    );
    this.resolve = resolve;
    this.reject = reject;
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    this.promise = promise;
    this.request = new XMLHttpRequest();

    this.request.withCredentials = options.withCredentials ?? false;

    let aborted: RSVP.Deferred<string>;
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    promise.cancel = () => {
      if (aborted == null) {
        aborted = RSVP.defer(`ember-file-upload: Abort ${options.label}`);
        this.request.abort();
      }
      return aborted.promise;
    };
    promise.then = function (...args) {
      const newPromise = RSVP.Promise.prototype.then.apply(this, args);
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      newPromise.cancel = promise.cancel;
      newPromise.then = promise.then;
      return newPromise;
    };
    this.request.onabort = bind(this, function () {
      this.onabort?.();
      aborted.resolve();
    });

    this.request.onloadstart =
      this.request.onprogress =
      this.request.onloadend =
        bind(this, function (evt) {
          this.onprogress?.(evt);
        });

    if (this.request.upload) {
      this.request.upload.onprogress = this.request.onprogress;
    }

    this.request.onload = bind(this, function () {
      const response = parseResponse(this.request);
      if (Math.floor(response.status / 200) === 1) {
        resolve(response);
      } else {
        reject(response);
      }
    });

    this.request.onerror = bind(this, function () {
      reject(parseResponse(this.request));
    });

    Object.defineProperty(this, 'timeout', {
      get() {
        return this.request.timeout;
      },
      set(timeout) {
        this.request.timeout = timeout;
      },
      enumerable: true,
      configurable: false,
    });

    this.request.ontimeout = bind(this, function () {
      this.ontimeout?.();
      reject(parseResponse(this.request));
    });
  }

  send(body: Parameters<XMLHttpRequest['send']>[0]) {
    this.request.send(body);
    return this.promise;
  }

  open(
    method: string,
    url: string | URL,
    _async: boolean,
    usename?: string,
    password?: string
  ) {
    this.request.open(method, url, true, usename, password);
  }

  setRequestHeader(name: string, value: string) {
    this.request.setRequestHeader(name, value);
  }
}
