import { FileUploadDragEvent } from '../interfaces';

const getDataSupport = {};

export default class DataTransferWrapper {
  dataTransfer?: DataTransfer;
  itemDetails?: DataTransferItem[];
  source?: FileUploadDragEvent['source'];

  constructor(event: FileUploadDragEvent) {
    this.source = event.source;
    this.dataTransfer = event.dataTransfer;
    this.itemDetails = event.itemDetails;
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

  get filesOrItems() {
    return this.files.length ? this.files : this.items;
  }

  get files() {
    return Array.from(this.dataTransfer?.files ?? []);
  }

  get items() {
    return this.itemDetails ?? Array.from(this.dataTransfer?.items ?? []);
  }
}
