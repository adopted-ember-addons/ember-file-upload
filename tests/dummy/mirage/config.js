import { upload } from 'ember-file-upload/mirage';
import config from '../config/environment';

export default function () {
  this.passthrough('/write-coverage');
  this.passthrough(`${config.rootURL}docs/data.json`);
  this.post('/photos/new', upload(function (db, request, file) {
    let { name: filename, size: filesize, url } = file;
    return db.create('photo', { filename, filesize, url, uploadedAt: new Date() });
  }));
}
