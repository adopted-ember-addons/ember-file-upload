import { A } from '@ember/array';

const getDataSupport = {};

export default class DataTransfer {
  dataTransfer = null;
  itemDetails = null;

  queue = null;
  source = null;

  constructor({ queue, source, dataTransfer, itemDetails }) {
    this.queue = queue;
    this.source = source;
    this.dataTransfer = dataTransfer;
    this.itemDetails = itemDetails;
  }

  getData(type) {
    let dataTransfer = this.dataTransfer;
    if (getDataSupport[type] == null) {
      try {
        let data = dataTransfer.getData(type);
        getDataSupport[type] = true;
        return data;
      } catch (e) {
        getDataSupport[type] = false;
      }
    } else if (getDataSupport[type]) {
      return dataTransfer.getData(type);
    }
  }

  get valid() {
    if (this.files == null) {
      return true;
    }

    return (
      (this.dataTransfer?.items?.length ||
        this.dataTransfer?.files?.length ||
        this.itemDetails?.length) === this.files.length
    );
  }

  get files() {
    let fileList = this.dataTransfer?.files || null;
    let itemList = this.dataTransfer?.items || null;
    let itemDetails = this.itemDetails;

    if (
      (fileList == null && itemList) ||
      (itemList != null &&
        fileList != null &&
        itemList.length > fileList.length)
    ) {
      fileList = itemList;
    }

    if (
      (fileList == null && itemDetails) ||
      (itemDetails != null &&
        fileList != null &&
        itemDetails.length > fileList.length)
    ) {
      fileList = itemDetails;
    }

    if (fileList == null) {
      return null;
    }

    let files = A();
    if (!this.queue?.multiple && fileList.length > 1) {
      files.push(fileList[0]);
    } else {
      for (let i = 0, len = fileList.length; i < len; i++) {
        files.push(fileList[i]);
      }
    }

    let accept = this.queue?.accept;
    if (accept == null) {
      return files;
    }

    let tokens = A(
      accept.split(',').map(function (token) {
        return token.trim().toLowerCase();
      })
    );
    let extensions = A(
      tokens.filter(function (token) {
        return token.indexOf('.') === 0;
      })
    );
    let mimeTypeTests = A(
      A(
        tokens.filter(function (token) {
          return token.indexOf('.') !== 0;
        })
      ).map(function (mimeType) {
        return function (type) {
          if (A(['audio/*', 'video/*', 'image/*']).includes(mimeType)) {
            return type.split('/')[0] === mimeType.split('/')[0];
          } else {
            return type === mimeType;
          }
        };
      })
    );

    return files.filter(function (file) {
      let extension = null;
      if (file.name && /(\.[^.]+)$/.test(file.name)) {
        extension = file.name.toLowerCase().match(/(\.[^.]+)$/)[1];
      }

      let type = file.type.toLowerCase();
      return (
        mimeTypeTests.find(function (mimeTypeTest) {
          return mimeTypeTest(type);
        }) || extensions.indexOf(extension) !== -1
      );
    });
  }
}
