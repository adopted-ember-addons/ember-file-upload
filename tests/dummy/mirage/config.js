import Ember from 'ember';
import FileReader from 'ember-file-upload/system/file-reader';

export default function () {
  this.upload = function (url, fn, options={ speed: 'average' }) {
    let speed = 0;
    switch (options.speed) {
    case 'average':
      speed = 1024 * 50;   // 50kb / s
      break;
    case 'fast':
      speed = 1024 * 4000; // 4mb / s
      break;
    case 'slow':
      speed = 1024 * 10;   // 10kb / s
      break;
    }

    let pretender = this.pretender;
    this.post('/photos/new', function (db, request) {
      let { promise, resolve } = Ember.RSVP.defer();
      let file = request.requestBody.get('file');
      let loaded = 0;
      let total = file.size;
      let reader = new FileReader();
      let url = reader.readAsDataURL(file);
      function upload() {
        if (loaded >= file.size) {
          request.upload.onprogress({
            lengthComputable: true,
            total,
            loaded: total
          });
          url.then(function (url) {
            resolve(fn({
              name: file.name,
              size: total,
              url
            }));
            Ember.run.next(function () {
              pretender.resolve(request);
            });
          });
        } else {
          request.upload.onprogress({
            lengthComputable: true,
            total,
            loaded
          });

          loaded += speed / 20;
          setTimeout(upload, 50);
        }
      }
      upload();
      return promise;
    }, null, { timing: true });
  };

  this.upload('/photos/new', function (file) {
    return {
      filename: file.name,
      filesize: file.size,
      uploadedAt: new Date(),
      url: file.url
    };
  });
}
