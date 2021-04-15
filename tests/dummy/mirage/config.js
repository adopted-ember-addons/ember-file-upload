import { upload } from 'ember-file-upload/test-support/mirage';

export default function () {
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

  this.passthrough('*');
}
