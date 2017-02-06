import Ember from 'ember';
import FileReader from 'ember-file-upload/system/file-reader';

const { RSVP } = Ember;

export function extractFormData(formData) {
  let data = {};
  let items = formData.entries();
  let item = items.next();
  let file = null;
  while (!item.done) {
    let [key, value] = item.value;
    if (value instanceof Blob) {
      file = { key, value };
    } else {
      data[key] = value;
    }
    item = items.next();
  }

  return { file, data };
}

let pipelines = {
  gif(file) {
    let reader = new FileReader();
    return reader.readAsArrayBuffer(file).then(function (buffer) {
      let data = new Uint8Array(buffer);
      let bin = '';
      let duration = 0;
      for (let i = 0; i < data.length; i++) {
        bin += String.fromCharCode(data[i]);

        // Find a Graphic Control Extension hex(21F904__ ____ __00)
        if (data[i] === 0x21 &&
            data[i + 1] === 0xF9 &&
            data[i + 2] === 0x04 &&
            data[i + 7] === 0x00) {
          // Swap 5th and 6th bytes to get the delay per frame
          let delay = (data[i + 5] << 8) | (data[i + 4] & 0xFF);

          // Should be aware browsers have a minimum frame delay
          // e.g. 6ms for IE, 2ms modern browsers (50fps)
          duration += delay < 2 ? 10 : delay;
        }
      }

      return {
        duration: duration / 1000,
        animated: duration > 0
      };
    });
  },

  image(file, metadata) {
    return new RSVP.Promise(function (resolve) {
      let img = new Image();
      img.onload = function () {
        resolve(img);
      };
      img.src = metadata.url;
    }).then(function (img) {
      return {
        width: img.naturalWidth,
        height: img.naturalHeight
      };
    });
  },

  video(file, metadata) {
    let video = document.createElement('video');
    return new RSVP.Promise(function (resolve) {
      video.addEventListener('loadeddata', resolve);
      video.src = metadata.url;
      document.body.appendChild(video);
      video.load();
    }).then(function () {
      return {
        duration: video.duration,
        width: video.videoWidth,
        height: video.videoHeight
      };
    }).finally(function () {
      document.body.removeChild(video);
    });
  },

  audio(file, metadata) {
    let audio = document.createElement('audio');
    return new RSVP.Promise(function (resolve) {
      audio.addEventListener('loadeddata', resolve);
      audio.src = metadata.url;
      document.body.appendChild(audio);
      audio.load();
    }).then(function () {
      return {
        duration: audio.duration
      };
    }).finally(function () {
      document.body.removeChild(audio);
    });
  }

};

export function extractFileMetadata(file) {
  let metadata = {
    name: file.name,
    size: file.size,
    type: file.type,
    extension: file.name.match(/\.(.*)$/)[1]
  };

  let reader = new FileReader();
  return reader.readAsDataURL(file).then(function (url) {
    metadata.url = url;

    let additionalMetadata = [];

    if (metadata.type === 'image/gif') {
      additionalMetadata.push(pipelines.gif(file, metadata));
    }
    if (metadata.type.match(/^image\//)) {
      additionalMetadata.push(pipelines.image(file, metadata));
    }
    if (metadata.type.match(/^video\//)) {
      additionalMetadata.push(pipelines.video(file, metadata));
    }
    if (metadata.type.match(/^audio\//)) {
      additionalMetadata.push(pipelines.audio(file, metadata));
    }
    return RSVP.all(additionalMetadata);
  }).then(function (additionalMetadata) {
    additionalMetadata.forEach(function (data) {
      Object.assign(metadata, data);
    });
    return metadata;
  });
}
