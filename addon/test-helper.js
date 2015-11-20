import Ember from 'ember';

function FakeFile(attrs) {
  this.id = Ember.generateGuid();
  attrs.plupload.total.size += attrs.size;
  Ember.merge(this, attrs);
}

FakeFile.prototype = {
  upload(settings) {
    this.settings = settings;
    this.percent = 0;
  },

  respondWith(status, headers, body) {
    let contentType = (headers['Content-Type'] || '').split(';');

    // Serialize if JSON
    if (contentType.indexOf('application/json') !== -1 ||
        contentType.indexOf('text/javascript') !== -1 ||
        contentType.indexOf('application/javascript') !== -1) {
      body = JSON.stringify(body);
    }
    let responseHeaders = Object.keys(headers).map(function (key) {
      return `${key}: ${headers[key]}`;
    }).join('\n');

    Ember.run(() => {
      this.queue.fileUploaded(this.plupload, this, {
        status,
        responseHeaders,
        response: body
      });
    });
  },

  get progress() {
    return this.percent;
  },

  set progress(value) {
    this.percent = value;
    Ember.run(() => {
      this.plupload.total.loaded += this.size * (value / 100);
      this.queue.progressDidChange(this.plupload, this);
    });
  }
};

export function addFiles(owner, name, ...files) {
  let uploader = owner.lookup('service:uploader');
  let queue = uploader.findOrCreate(name);

  Ember.assert(queue, `To add a file, you must have queue with the name='${name}'`);

  let plupload = queue.get('queues.lastObject');
  files = files.map(function (file) {
    return new FakeFile(Ember.merge({ queue, plupload }, file));
  });

  Ember.run(function () {
    queue.filesAdded(plupload, files);
  });

  return files;
}
