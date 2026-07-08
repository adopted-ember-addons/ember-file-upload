import type { FileUploadDragEvent } from '../interfaces.ts';
import {
  readDataTransferItems,
  type FileWithPath,
} from './directory-reader.ts';

const getDataSupport = {};

export default class DataTransferWrapper {
  dataTransfer?: DataTransfer;
  itemDetails?: FileUploadDragEvent['itemDetails'];
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
      } catch {
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

  /**
   * Read all dropped files, recursing into dropped directories.
   *
   * Must be called synchronously from the `drop` event handler — browsers
   * neuter `DataTransferItem`s once the handler yields.
   */
  getFilesWithPaths(): Promise<FileWithPath[]> {
    const items = Array.from(this.dataTransfer?.items ?? []);

    if (items.length) {
      return readDataTransferItems(items);
    }

    return Promise.resolve(
      this.files.map((file) => ({ file, relativePath: '' })),
    );
  }

  get files() {
    return Array.from(this.dataTransfer?.files ?? []);
  }

  get items() {
    return this.itemDetails ?? Array.from(this.dataTransfer?.items ?? []);
  }
}
