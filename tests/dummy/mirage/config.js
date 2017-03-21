import { upload } from 'ember-file-upload/mirage';

export default function () {
  this.passthrough('/write-coverage');
  this.post('/photos/new', upload(function (db, request) {
    let { type, name, size, url } = request.requestBody.file;
    return {
      filename: name,
      filesize: size,
      uploadedAt: new Date(),
      url,
      type: type.split('/')[0]
    };
  }));
}
