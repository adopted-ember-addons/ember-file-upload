import RSVP from 'rsvp';

import { extractFormData, extractFileMetadata } from './utils';
import {
  macroCondition,
  dependencySatisfies,
  importSync,
} from '@embroider/macros';

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
  if (
    macroCondition(
      dependencySatisfies('miragejs', '*') &&
        dependencySatisfies('ember-cli-mirage', '*')
    )
  ) {
    const { Response } = importSync('miragejs');
    return function (db, request) {
      let speed = Infinity;

      if (NETWORK[options.network]) {
        speed = NETWORK[options.network] * 1024;
      }

      const { file, data } = extractFormData(request.requestBody);
      let loaded = 0;
      const total = file.value.size;

      return new RSVP.Promise((resolve) => {
        const start = new Date().getTime();

        const upload = async () => {
          const timedOut =
            options.timeout && new Date().getTime() - start > options.timeout;
          if (timedOut || loaded >= total) {
            request.upload.onprogress({
              lengthComputable: true,
              total,
              loaded: Math.min(loaded, total),
            });

            const metadata = await extractFileMetadata(file.value);
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
  } else {
    throw new Error(
      'You must add ember-cli-mirage and miragejs to your app to use this helper.'
    );
  }
}
