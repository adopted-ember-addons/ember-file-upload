import type { FileUploadDragEvent } from '../interfaces.ts';

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

  async getFilesAndDirectories() {
    const files: File[] = [];

    const readEntry = async (entry: FileSystemEntry): Promise<File> => {
      return new Promise((resolve, reject) => {
        if (entry.isFile) {
          (entry as FileSystemFileEntry).file((fileEntry: File) => {
            resolve(fileEntry);
          });
        } else {
          reject('Directory contains nested directories');
        }
      });
    };

    const readAllFilesInDirectory = (item: DataTransferItem): Promise<File[]> =>
      new Promise((resolve) => {
        (item.webkitGetAsEntry() as FileSystemDirectoryEntry)
          ?.createReader()
          ?.readEntries(async (entries: FileSystemEntry[]) => {
            const readFiles: File[] = await Promise.all(
              entries.map(readEntry),
            ).catch((err) => {
              throw err;
            });
            resolve(readFiles.filter((file) => file !== undefined) as File[]);
          });
      });

    const readDataTransferItem = async (
      item: DataTransferItem,
    ): Promise<File[]> => {
      if (item.webkitGetAsEntry()?.isDirectory) {
        const directoryFile = item.getAsFile() as File;
        const filesInDirectory: File[] = await readAllFilesInDirectory(item);
        return [directoryFile, ...filesInDirectory];
      } else {
        const fileItem = item.getAsFile() as File;
        return [fileItem];
      }
    };

    if (this.dataTransfer?.items) {
      const allFilesInDataTransferItems: File[][] = await Promise.all(
        Array.from(this.dataTransfer?.items).map(readDataTransferItem),
      );

      const flattenedFileArray: File[] = allFilesInDataTransferItems.reduce(
        (flattenedList, fileList) => {
          return [...flattenedList, ...fileList];
        },
        [],
      );

      files.push(...flattenedFileArray);
    } else {
      const droppedFiles: File[] = Array.from(this.dataTransfer?.files ?? []);
      files.push(...droppedFiles);
    }

    return files;
  }

  get files() {
    return Array.from(this.dataTransfer?.files ?? []);
  }

  get items() {
    return this.itemDetails ?? Array.from(this.dataTransfer?.items ?? []);
  }
}
