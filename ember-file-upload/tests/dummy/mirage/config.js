import { upload } from 'ember-file-upload/mirage';
import { discoverEmberDataModels } from 'ember-cli-mirage';
import { createServer } from 'miragejs';

export default function (config) {
  let finalConfig = {
    ...config,
    models: { ...discoverEmberDataModels(), ...config.models },
    routes() {
      this.post(
        '/photos/new',
        upload(function (db, request) {
          let { type, name, size, url } = request.requestBody.file;
          return db.create('photo', {
            filename: name,
            filesize: size,
            uploadedAt: new Date(),
            url,
            type: type.split('/')[0],
          });
        })
      );

      this.passthrough('*');
    },
  };

  return createServer(finalConfig);
}
