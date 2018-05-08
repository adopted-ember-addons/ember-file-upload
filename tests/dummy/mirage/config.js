import { upload } from 'ember-file-upload/mirage';
import config from '../config/environment';

export default function () {
  this.passthrough('/write-coverage');
  this.passthrough(`${config.rootURL}docs/ember-file-upload.json`);
  this.post('/photos/new', upload(function (db, request) {
    let { type, name, size, url } = request.requestBody.file;
    return db.create('photo', {
      filename: name,
      filesize: size,
      uploadedAt: new Date(),
      url,
      type: type.split('/')[0]
    });
  }));
}
