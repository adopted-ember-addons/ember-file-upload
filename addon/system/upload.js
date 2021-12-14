import { assert } from '@ember/debug';
import HTTPRequest from './http-request';
import RSVP from 'rsvp';
import { buildWaiter } from '@ember/test-waiters';

const uploadWaiter = buildWaiter('ember-file-upload:upload');

function normalizeOptions(file, url, options) {
  if (typeof url === 'object') {
    options = url;
    url = null;
  }

  options = options || {};

  options.url = options.url || url;
  options.method = options.method || 'POST';
  options.accepts = options.accepts || ['application/json', 'text/javascript'];
  if (!Object.prototype.hasOwnProperty.call(options, 'contentType')) {
    options.contentType = file.type;
  }
  options.headers = options.headers || {};
  options.data = options.data || {};
  options.fileKey = options.fileKey || 'file';

  if (options.headers.Accept == null) {
    if (!Array.isArray(options.accepts)) {
      options.accepts = [options.accepts];
    }
    options.headers.Accept = options.accepts.join(',');
  }

  // Set Content-Type in the data payload
  // instead of the headers, since the header
  // for Content-Type will always be multipart/form-data
  if (options.contentType) {
    options.data['Content-Type'] = options.contentType;
  }

  options.data[options.fileKey] = file.blob;

  options.withCredentials = options.withCredentials || false;

  return options;
}

export function upload(file, url, opts, uploadFn) {
  if (['queued', 'failed', 'timed_out', 'aborted'].indexOf(file.state) === -1) {
    assert(
      `The file ${file.id} is in the state "${file.state}" and cannot be requeued.`
    );
  }

  const options = normalizeOptions(file, url, opts);

  const request = new HTTPRequest({
    withCredentials: options.withCredentials,
    label: `${options.method} ${file.name} to ${options.url}`,
  });

  request.open(options.method, options.url);

  Object.keys(options.headers).forEach(function (key) {
    request.setRequestHeader(key, options.headers[key]);
  });

  if (options.timeout) {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    request.timeout = options.timeout;
  }

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  request.onprogress = function (evt) {
    if (!evt.lengthComputable || evt.total === 0) return;

    file.loaded = evt.loaded;
    file.size = evt.total;
    file.progress = (evt.loaded / evt.total) * 100;
  };

  request.ontimeout = function () {
    file.state = 'timed_out';
  };

  request.onabort = function () {
    file.state = 'aborted';
  };

  file.state = 'uploading';

  const token = uploadWaiter.beginAsync();

  return uploadFn(request, options)
    .then(
      function (result) {
        file.state = 'uploaded';
        return result;
      },
      function (error) {
        file.state = 'failed';
        return RSVP.reject(error);
      }
    )
    .finally(() => uploadWaiter.endAsync(token));
}
