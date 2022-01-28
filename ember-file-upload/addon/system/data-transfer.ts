import { A } from '@ember/array';
import { ItemDetail, FileUploadDragEvent } from '../components/file-dropzone';

const getDataSupport = {};

export default class FileUploadDataTransfer {
  dataTransfer?: DataTransfer;
  itemDetails?: ItemDetail[];
  source?: FileUploadDragEvent['source'];

  constructor(
    source: FileUploadDragEvent['source'],
    dataTransfer: DataTransfer,
    itemDetails: ItemDetail[]
  ) {
    this.source = source;
    this.dataTransfer = dataTransfer;
    this.itemDetails = itemDetails;
  }

  getData(type: string) {
    const dataTransfer = this.dataTransfer;
    if (!dataTransfer) return;

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    if (getDataSupport[type] == null) {
      try {
        const data = dataTransfer.getData(type);
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        getDataSupport[type] = true;
        return data;
      } catch (e) {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        getDataSupport[type] = false;
      }
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
    } else if (getDataSupport[type]) {
      return dataTransfer.getData(type);
    }
    return '';
  }

  get files() {
    let fileList: FileList | DataTransferItemList | ItemDetail[] | null =
      this.dataTransfer?.files ?? null;
    const itemList = this.dataTransfer?.items ?? null;
    const itemDetails = this.itemDetails;

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

    const files = A();
    for (let i = 0, len = fileList.length; i < len; i++) {
      files.push(fileList[i]);
    }
    return files;
  }
}
