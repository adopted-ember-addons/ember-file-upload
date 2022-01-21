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

export function upload(fn, options = { network: null, timeout: null }) {
  return function (db, request) {
    let speed = Infinity;

    if (NETWORK[options.network]) {
      speed = NETWORK[options.network] * 1024;
    }

    let { file, data } = extractFormData(request.requestBody);
    let loaded = 0;
    let total = file.value.size;

    return new RSVP.Promise((resolve) => {
      let start = new Date().getTime();
      let metadata = extractFileMetadata(file.value);

      let upload = () => {
        let timedOut =
          options.timeout && new Date().getTime() - start > options.timeout;
        if (timedOut || loaded >= total) {
          request.upload.onprogress({
            lengthComputable: true,
            total,
            loaded: Math.min(loaded, total),
          });

          metadata
            .then((metadata) => {
              request.requestBody = Object.assign(
                {
                  [file.key]: metadata,
                },
                data
              );
              if (timedOut) {
                resolve(new Response(408));
                return;
              }

              resolve(fn.call(this, db, request));
            })
            .catch((error) => {
              resolve(new Response(500, {}, { error: error.message }));
            });
        } else {
          request.upload.onprogress({
            lengthComputable: true,
            total,
            loaded,
          });

          loaded += speed / 20;
          setTimeout(upload, 50);
        }
      };
      upload();
    });
  };
}
