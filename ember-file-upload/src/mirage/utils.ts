import RSVP from 'rsvp';
import UploadFileReader from '../system/upload-file-reader';
import { assert } from '@ember/debug';

interface AdditionalMetadata {
  hasAdditionalMetadata?: boolean;
  duration?: number;
  animated?: boolean;
  width?: number;
  height?: number;
}

interface FileMetadata extends AdditionalMetadata {
  name: string;
  size: number;
  type: string;
  extension: string;
  url: string;
}

export function extractFormData(formData: FormData) {
  let data = {};
  let file: { key: string; value: File } | null = null;

  for (const [key, value] of formData.entries()) {
    if (value instanceof File) {
      file = { key, value };
      continue;
    }
    data = { ...data, [key]: value };
  }

  assert('Failed find a file in request body', file?.key && file?.value);

  return { file, data };
}

const pipelines = {
  async gif(file: File): Promise<AdditionalMetadata> {
    const buffer = (await new UploadFileReader().readAsArrayBuffer(
      file
    )) as ArrayBuffer;
    const data = new Uint8Array(buffer);
    let duration = 0;
    for (let i = 0; i < data.length; i++) {
      // Find a Graphic Control Extension hex(21F904__ ____ __00)
      if (
        data[i] === 0x21 &&
        data[i + 1] === 0xf9 &&
        data[i + 2] === 0x04 &&
        data[i + 7] === 0x00
      ) {
        // Swap 5th and 6th bytes to get the delay per frame
        const delay = (data[i + 5] << 8) | (data[i + 4] & 0xff);

        // Should be aware browsers have a minimum frame delay
        // e.g. 6ms for IE, 2ms modern browsers (50fps)
        duration += delay < 2 ? 10 : delay;
      }
    }

    return {
      hasAdditionalMetadata: true,
      duration: duration / 1000,
      animated: duration > 0,
    };
  },

  image(_file: File, metadata: FileMetadata): RSVP.Promise<AdditionalMetadata> {
    return new RSVP.Promise(function (resolve) {
      const img = new Image();
      img.onload = () => resolve({ hasAdditionalMetadata: true, img });
      img.onerror = () => resolve({ hasAdditionalMetadata: false });
      img.src = metadata.url;
    }).then(function ({ hasAdditionalMetadata, img }) {
      return {
        hasAdditionalMetadata,
        width: img?.naturalWidth,
        height: img?.naturalHeight,
      };
    });
  },

  video(_file: File, metadata: FileMetadata): RSVP.Promise<AdditionalMetadata> {
    const videoEl = document.createElement('video');
    return new RSVP.Promise(function (resolve) {
      videoEl.addEventListener('loadeddata', () =>
        resolve({ hasAdditionalMetadata: true, video: videoEl })
      );
      videoEl.onerror = () => resolve({ hasAdditionalMetadata: false });
      videoEl.src = metadata.url;
      document.body.appendChild(videoEl);
      videoEl.load();
    })
      .then(function ({ hasAdditionalMetadata, video }) {
        return {
          hasAdditionalMetadata,
          duration: video?.duration,
          width: video?.videoWidth,
          height: video?.videoHeight,
        };
      })
      .finally(function () {
        document.body.removeChild(videoEl);
      });
  },

  audio(_file: File, metadata: FileMetadata): RSVP.Promise<AdditionalMetadata> {
    const audioEl = document.createElement('audio');
    return new RSVP.Promise(function (resolve) {
      audioEl.addEventListener('loadeddata', () =>
        resolve({ hasAdditionalMetadata: true, audio: audioEl })
      );
      audioEl.onerror = () => resolve({ hasAdditionalMetadata: false });
      audioEl.src = metadata.url;
      document.body.appendChild(audioEl);
      audioEl.load();
    })
      .then(function ({ hasAdditionalMetadata, audio }) {
        return {
          hasAdditionalMetadata,
          duration: audio?.duration,
        };
      })
      .finally(function () {
        document.body.removeChild(audioEl);
      });
  },
};

export async function extractFileMetadata(file: File) {
  const url = (await new UploadFileReader().readAsDataURL(file)) as string;

  const metadata: FileMetadata = {
    name: file.name,
    size: file.size,
    type: file.type,
    extension: (file.name.match(/\.(.*)$/) || [])[1],
    url,
  };

  const metadataPipelines = [];

  if (metadata.type === 'image/gif') {
    metadataPipelines.push(pipelines.gif(file));
  }
  if (metadata.type.match(/^image\//)) {
    metadataPipelines.push(pipelines.image(file, metadata));
  }
  if (metadata.type.match(/^video\//)) {
    metadataPipelines.push(pipelines.video(file, metadata));
  }
  if (metadata.type.match(/^audio\//)) {
    metadataPipelines.push(pipelines.audio(file, metadata));
  }

  const additionalMetadata = await RSVP.all(metadataPipelines);

  additionalMetadata.forEach(function (data) {
    Object.assign(metadata, data);
  });

  // Collapse state of `hasAdditionalMetadata` from multiple pipelines
  // Should be `true` if at least one pipeline succeeded
  metadata.hasAdditionalMetadata = additionalMetadata.some(
    (data) => data.hasAdditionalMetadata
  );

  return metadata;
}
