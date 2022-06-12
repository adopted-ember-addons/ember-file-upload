import RSVP from 'rsvp';
import { Response } from 'miragejs';
import { extractFormData, extractFileMetadata } from './utils';

const NETWORK = {
  wired: 50000, // 500 Mb/s
  wifi: 15000, // 15 Mb/s
  dsl: 1000, // 1 Mb/s
  '4g': 3000, // 4 Mb/s
  '3g': 250, // 250 kb/s
  '2g': 50, // 50 kb/s
  gprs: 20, // 20 kb/s
  offline: 0,
};

interface FakeRequest {
  requestBody: FormData | object; // Replaced with an object by this handler
  upload: {
    onprogress: (event: ProgressEvent<EventTarget>) => void;
  };
}

export default function uploadHandler(
  fn: (this: void, db: any, request: FakeRequest) => void,
  options = { network: null, timeout: null }
) {
  return function (db: any, request: FakeRequest) {
    let speed = Infinity;

    if (options.network && NETWORK[options.network]) {
      speed = NETWORK[options.network] * 1024;
    }

    const { file, data } = extractFormData(request.requestBody as FormData);
    let loaded = 0;
    const total = file.value.size;

    return new RSVP.Promise((resolve) => {
      const start = new Date().getTime();

      const upload = async () => {
        const timedOut =
          options.timeout && new Date().getTime() - start > options.timeout;
        if (timedOut || loaded >= total) {
          request.upload.onprogress(
            new ProgressEvent('progress', {
              lengthComputable: true,
              total,
              loaded: Math.min(loaded, total),
            })
          );

          const metadata = await extractFileMetadata(file.value);
          request.requestBody = { [file.key]: metadata, ...data };

          if (timedOut) {
            resolve(new Response(408));
            return;
          }

          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          resolve(fn.call(this, db, request));
        } else {
          request.upload.onprogress(
            new ProgressEvent('progress', {
              lengthComputable: true,
              total,
              loaded,
            })
          );

          loaded += speed / 20;
          setTimeout(upload, 50);
        }
      };
      upload();
    });
  };
}
