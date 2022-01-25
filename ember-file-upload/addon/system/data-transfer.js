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

    return files;
  }
}
