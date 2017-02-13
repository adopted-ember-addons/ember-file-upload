import Ember from 'ember';
import trim from './trim';

const { RSVP, $ } = Ember;
const { bind } = Ember.run;

function getHeader(headers, header) {
  let headerKeys = Object.keys(headers);
  let headerIdx = headerKeys.map((key) => key.toLowerCase()).indexOf(header.toLowerCase());
  if (headerIdx !== -1) {
    return headers[headerKeys[headerIdx]];
  }
  return null;
}

function parseResponse(request) {
  var body = trim(request.responseText);
  var rawHeaders = request.getAllResponseHeaders().split(/\n|\r/).filter(function (header) {
    return header !== '';
  });

  var headers = rawHeaders.reduce(function (E, header) {
    var parts = header.split(/^([0-9A-Za-z_-]*:)/);
    if (parts.length > 0){
      E[parts[1].slice(0, -1)] = trim(parts[2]);
    }
    return E;
  }, {});

  let contentType = (getHeader(headers, 'Content-Type') || '').split(';');

  // Parse body according to the Content-Type received by the server
  if (contentType.indexOf('text/html') !== -1) {
    body = $.parseHTML(body);
  } else if (contentType.indexOf('text/xml') !== -1) {
    body = $.parseXML(body);
  } else if (contentType.indexOf('application/json') !== -1 ||
             contentType.indexOf('text/javascript') !== -1 ||
             contentType.indexOf('application/javascript') !== -1) {
    body = $.parseJSON(body);
  }

  return {
    status: request.status,
    body: body,
    headers: headers
  };
}

export default function (options = {}) {
  let { resolve, reject, promise } = RSVP.defer(`ember-file-upload: ${options.label}`);
  let request = new XMLHttpRequest();

  let aborted;
  promise.cancel = () => {
    if (aborted == null) {
      aborted = RSVP.defer(`ember-file-upload: Abort ${options.label}`);
      request.abort();
    }
    return aborted.promise;
  };
  request.onabort = bind(this, function () {
    this.onabort();
    aborted.resolve();
  });

  this.setRequestHeader = function (header, value) {
    request.setRequestHeader(header, value);
  };

  this.open = function (method, url, _, username='', password='') {
    request.open(method, url, true, username, password);
  };

  this.send = function (data) {
    request.send(data);
    return promise;
  };

  this.onprogress = this.onprogress || function () {};
  this.ontimeout = this.ontimeout || function () {};
  this.onabort = this.onabort || function () {};

  request.onloadstart = request.onprogress = request.onloadend = bind(this, function (evt) {
    this.onprogress(evt);
  });

  if (request.upload) {
    request.upload.onprogress = request.onprogress;
  }

  request.onload = bind(this, function () {
    let response = parseResponse(request);
    if (Math.floor(response.status / 200) === 1) {
      resolve(response);
    } else {
      reject(response);
    }
  });

  request.onerror = bind(this, function () {
    reject(parseResponse(request));
  });


  Object.defineProperty(this, 'timeout', {
    get() {
      return request.timeout;
    },
    set(timeout) {
      request.timeout = timeout;
    },
    enumerable: true,
    configurable: false
  });

  request.ontimeout = bind(this, function () {
    this.ontimeout();
    reject(parseResponse(request));
  });
}
