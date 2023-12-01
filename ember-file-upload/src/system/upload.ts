import { assert } from '@ember/debug';
import HTTPRequest from './http-request.ts';
import RSVP from 'rsvp';
import { waitForPromise } from '@ember/test-waiters';
import type { UploadFile } from '../upload-file.ts';
import { FileState, type UploadOptions } from '../interfaces.ts';

function clone(object: object | undefined) {
  return object ? { ...object } : {};
}

function normalizeOptions(
  file: UploadFile,
  url: string | object | undefined,
  options?: UploadOptions,
) {
  if (typeof url === 'object') {
    options = url;
    url = undefined;
  }

  options = clone(options);

  options.url = options.url || url;
  options.method = options.method || 'POST';
  options.accepts = options.accepts || ['application/json', 'text/javascript'];
  if (!Object.prototype.hasOwnProperty.call(options, 'contentType')) {
    options.contentType = file.type;
  }
  options.headers = clone(options.headers);
  options.data = clone(options.data);
  options.fileKey = options.fileKey || 'file';

  if (options.headers['Accept'] == null) {
    if (!Array.isArray(options.accepts)) {
      options.accepts = [options.accepts];
    }
    options.headers['Accept'] = options.accepts.join(',');
  }

  // Set Content-Type in the data payload
  // instead of the headers, since the header
  // for Content-Type will always be multipart/form-data
  if (options.contentType) {
    options.data['Content-Type'] = options.contentType;
  }

  options.data[options.fileKey] = file.file;

  options.withCredentials = options.withCredentials || false;

  return options;
}

function updateRate(file: UploadFile) {
  const updatedTime = new Date().getTime();

  // If there's a previous recording, we can calculate a rate from that
  if (file.timestampWhenProgressLastUpdated) {
    const timeElapsedSinceLastUpdate =
      updatedTime - file.timestampWhenProgressLastUpdated;

    const bytesTransferredSinceLastUpdate =
      file.loaded - file.bytesWhenProgressLastUpdated;

    // Divide by elapsed time to get bytes per millisecond
    const rate = bytesTransferredSinceLastUpdate / timeElapsedSinceLastUpdate;

    file.rates = [...file.rates, rate];
  }

  // Finally set current state to be picked up by next invocation
  file.bytesWhenProgressLastUpdated = file.loaded;
  file.timestampWhenProgressLastUpdated = updatedTime;
}

export function onloadstart(
  file: UploadFile,
  event?: ProgressEvent<EventTarget>,
) {
  if (!event) return;
  if (!event.lengthComputable || event.total === 0) return;

  file.loaded = event.loaded;
  // It occurs that the event.total is not always correct.
  // For this reason we should hold the max file size.
  // The correct should be returned while progress
  file.size = Math.max(file.size, event.total);
  file.progress = (file.loaded / file.size) * 100;

  updateRate(file);
}

export function onprogress(
  file: UploadFile,
  event?: ProgressEvent<EventTarget>,
) {
  if (!event) return;
  // We need to check also for isUploadComplete, because the browsers brings sometimes the onprogress after onloadend event
  if (!event.lengthComputable || event.total === 0 || file.isUploadComplete)
    return;

  file.size = event.total;

  // When the progress is completed there is possible that we get the `Content-Length` response header of the upload endpoint as loaded / total.
  // There is possible that `Content-Length` is lower or higher than the already loaded bytes.
  // if there is lower, we want to keep the higher loaded value, otherwise the progress percentage will be decreased
  // When the event.loaded is higher than the start file.size, we use the file.size, otherwise it can occur that progress for the file is higher than 100%
  let loaded = event.loaded;
  if (loaded > file.size) {
    loaded = file.size;
  }
  file.loaded = Math.max(loaded, file.loaded);
  file.progress = (file.loaded / file.size) * 100;

  updateRate(file);
}

export function onloadend(
  file: UploadFile,
  event?: ProgressEvent<EventTarget>,
) {
  if (!event) return;
  if (!event.lengthComputable || event.total === 0) return;

  file.loaded = file.size;
  file.progress = (file.loaded / file.size) * 100;
  file.isUploadComplete = true;
  file.bytesWhenProgressLastUpdated = 0;
  file.timestampWhenProgressLastUpdated = 0;
}

export function upload(
  file: UploadFile,
  url: string | object,
  opts: UploadOptions | undefined,
  uploadFn: (request: HTTPRequest, options: UploadOptions) => Promise<Response>,
) {
  if (['queued', 'failed', 'timed_out', 'aborted'].indexOf(file.state) === -1) {
    assert(
      `The file ${file.id} is in the state "${file.state}" and cannot be requeued.`,
    );
  }

  const options = normalizeOptions(file, url, opts);

  const request = new HTTPRequest({
    withCredentials: options.withCredentials,
    label: `${options.method} ${file.name} to ${options.url}`,
  });

  request.open(options.method ?? 'POST', options.url ?? '', true, '', '');

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  Object.keys(options.headers).forEach(function (key) {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    request.setRequestHeader(key, options.headers[key]);
  });

  if (options.timeout) {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    request.timeout = options.timeout;
  }

  request.onloadstart = (event) => onloadstart(file, event);
  request.onprogress = (event) => onprogress(file, event);
  request.onloadend = (event) => onloadend(file, event);

  request.ontimeout = () => {
    file.bytesWhenProgressLastUpdated = 0;
    file.timestampWhenProgressLastUpdated = 0;
    file.state = FileState.TimedOut;
    file.queue?.flush();
  };
  request.onabort = () => {
    file.bytesWhenProgressLastUpdated = 0;
    file.timestampWhenProgressLastUpdated = 0;
    file.state = FileState.Aborted;
    file.queue?.flush();
  };
  file.state = FileState.Uploading;

  return waitForPromise(
    uploadFn(request, options)
      .then(function (response) {
        file.state = FileState.Uploaded;
        file.queue?.uploadSucceeded(file, response);
        return response;
      })
      .catch(function (response) {
        file.state = FileState.Failed;
        file.queue?.uploadFailed(file, response);
        return RSVP.reject(response);
      })
      .finally(() => file.queue?.flush()),
  );
}
