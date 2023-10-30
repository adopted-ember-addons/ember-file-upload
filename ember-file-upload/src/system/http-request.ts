import { bind } from '@ember/runloop';
import RSVP from 'rsvp';
import type { HTTPRequestOptions } from '../interfaces.ts';

function parseHeaders(headerString: string) {
  return headerString
    .split(/\n|\r/)
    .filter((str) => str !== '')
    .reduce((headers: Headers, headerString: string) => {
      const parts = headerString.split(/^([0-9A-Za-z_-]*:)/);
      if (parts.length > 0 && parts[1] && parts[2]) {
        headers.append(parts[1].slice(0, -1), parts[2].trim());
      }
      return headers;
    }, new Headers());
}

function parseResponse(request: XMLHttpRequest): Response {
  const body = request.response === '' ? null : request.response;
  if (request.status >= 200 && request.status < 600) {
    return new Response(body, {
      status: request.status,
      statusText: request.statusText,
      headers: parseHeaders(request.getAllResponseHeaders()),
    });
  } else {
    return Response.error();
  }
}

export default class HTTPRequest {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  onloadstart: (event?: ProgressEvent<EventTarget>) => void | undefined;
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  onprogress: (event?: ProgressEvent<EventTarget>) => void | undefined;
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  onloadend: (event?: ProgressEvent<EventTarget>) => void | undefined;
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  ontimeout: (event?: ProgressEvent<EventTarget>) => void | undefined;
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  onabort: (event?: ProgressEvent<EventTarget>) => void | undefined;

  request;
  resolve;
  reject;
  promise: RSVP.Promise<Response>;

  constructor(options: HTTPRequestOptions = {}) {
    const { resolve, reject, promise } = RSVP.defer(
      `ember-file-upload: ${options.label}`,
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
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
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

    this.request.onloadstart = bind(this, function (evt) {
      this.onloadstart?.(evt);
    });
    this.request.onprogress = bind(this, function (evt) {
      this.onprogress?.(evt);
    });
    this.request.onloadend = bind(this, function (evt) {
      this.onloadend?.(evt);
    });

    if (this.request.upload) {
      this.request.upload.onloadstart = this.request.onloadstart;
      this.request.upload.onprogress = this.request.onprogress;
      this.request.upload.onloadend = this.request.onloadend;
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
    password?: string,
  ) {
    this.request.open(method, url, true, usename, password);
  }

  setRequestHeader(name: string, value: string) {
    this.request.setRequestHeader(name, value);
  }
}
