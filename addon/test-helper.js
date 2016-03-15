/* global mOxie */
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
  },

  getSource() {
    return this;
  }
};

mOxie.FileReader = function () {};
mOxie.FileReader.prototype = {
  read(type, source) {
    Ember.assert(`"${source.name}" doesn't have a ${type} for the file to read
When calling addFiles(), provide the following property:

addFiles(this.container, "${source.queueName}", {
  name: "${source.name}",
  size: ${source.size},
  ${type}: Ember.RSVP.resolve("your source here")
})`, source[type]);
    source[type].then((result) => {
      this.result = result;
      this.onloadend();
    }, (error) => {
      this.error = error;
      this.onerror();
    });
  },

  readAsArrayBuffer(source) {
    this.read('arrayBuffer', source);
  },

  readAsDataURL(source) {
    this.read('dataURL', source);
  },

  readAsBinaryString(source) {
    this.read('binaryString', source);
  },

  readAsText(source) {
    this.read('text', source);
  }
};

export function addFiles(owner, name, ...files) {
  let uploader = owner.lookup('service:uploader');
  let queue = uploader.findOrCreate(name);

  Ember.assert(`To add a file, you must have queue with the name='${name}'`, queue);

  let plupload = queue.get('queues.lastObject');
  files = files.map(function (file) {
    return new FakeFile(Ember.merge({ queue, plupload, queueName: name }, file));
  });

  Ember.run(function () {
    queue.filesAdded(plupload, files);
  });

  return files;
}
