import type { FileUploadDragEvent } from '../interfaces.ts';

interface FutureProofDataTransferItem extends DataTransferItem {
  getAsEntry?: () => FileSystemDirectoryEntry | null;
}

const getDataSupport = {};

// this will read a filesystementry into a File object, but ignore the entry if it is a directory
const readEntry = (entry: FileSystemEntry): Promise<File> => {
  return new Promise((resolve) => {
    if (entry.isFile) {
      (entry as FileSystemFileEntry).file((fileEntry: File) => {
        resolve(fileEntry);
      });
    }
  });
};

const getEntry = (
  item: FutureProofDataTransferItem,
): FileSystemDirectoryEntry => {
  // In the future this method name might change, so already implementing it like this if needed
  // https://developer.mozilla.org/en-US/docs/Web/API/DataTransferItem/webkitGetAsEntry
  return (
    item.getAsEntry?.() ?? (item.webkitGetAsEntry() as FileSystemDirectoryEntry)
  );
};

// this will read all the files directly in the given directory, but ignore any nested directory entries and the files therein.
const readAllFilesInDirectory = (item: DataTransferItem): Promise<File[]> =>
  new Promise((resolve, reject) => {
    const entry = getEntry(item);
    if (!entry) {
      reject('Could not read directory');
    }

    entry?.createReader()?.readEntries(async (entries: FileSystemEntry[]) => {
      const readFiles: File[] = await Promise.all(entries.map(readEntry)).catch(
        (err) => {
          throw err;
        },
      );
      resolve(readFiles.filter(Boolean) as File[]);
    });
  });

const readDataTransferItem = async (
  item: DataTransferItem,
): Promise<File[]> => {
  if (getEntry(item)?.isDirectory) {
    return readAllFilesInDirectory(item);
  } else {
    const fileItem = item.getAsFile() as File;
    return [fileItem];
  }
};

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

      return flattenedFileArray;
    } else {
      const droppedFiles: File[] = Array.from(this.dataTransfer?.files ?? []);
      return droppedFiles;
    }
  }

  get files() {
    return Array.from(this.dataTransfer?.files ?? []);
  }

  get items() {
    return this.itemDetails ?? Array.from(this.dataTransfer?.items ?? []);
  }
}
