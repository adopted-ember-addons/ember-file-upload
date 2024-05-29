import type { FileUploadDragEvent } from '../interfaces.ts';

interface FutureProofDataTransferItem extends DataTransferItem {
  getAsEntry?: () => FileSystemDirectoryEntry | null;
}

export interface FileWithDirectory {
  file: File;
  folderName?: string;
}

const getDataSupport = {};

// this will read a filesystementry into a File object, but ignore the entry if it is a directory
const readEntry = (entry: FileSystemEntry): Promise<File | void> => {
  return new Promise((resolve) => {
    if (entry.isFile) {
      (entry as FileSystemFileEntry).file((fileEntry: File) => {
        resolve(fileEntry);
      });
    } else {
      console.warn(`The dropped directory contains a subdirectory ${entry.fullPath}, the contents of this will be skipped.`);
      resolve();
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
      const readFiles: (File | void)[] = await Promise.all(entries.map(readEntry))
      .catch(
        (err) => {
          console.error(err)
          throw err;
        },
      );
      resolve(readFiles.filter(Boolean) as File[]);
    });
  });

const readDataTransferItem = async (
  item: DataTransferItem,
): Promise<FileWithDirectory[]> => {
  const entry = getEntry(item);
  if (entry?.isDirectory) {
    return (await readAllFilesInDirectory(item)).map((file) => ({
      file,
      folderName: entry?.name,
    }));
  } else {
    const fileItem = item.getAsFile() as File;
    return [{ file: fileItem }];
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

  async getFilesAndDirectories(): Promise<FileWithDirectory[]> {
    if (this.dataTransfer?.items) {
      const allFilesInDataTransferItems: FileWithDirectory[][] =
        await Promise.all(
          Array.from(this.dataTransfer?.items).map(readDataTransferItem),
        );

      const flattenedFileArray: FileWithDirectory[] =
        allFilesInDataTransferItems.reduce((flattenedList, fileList) => {
          return [...flattenedList, ...fileList];
        }, []);

      return flattenedFileArray;
    } else {
      const droppedFiles: File[] = Array.from(this.dataTransfer?.files ?? []);
      return droppedFiles.map((file) => ({ file }));
    }
  }

  get files() {
    return Array.from(this.dataTransfer?.files ?? []);
  }

  get items() {
    return this.itemDetails ?? Array.from(this.dataTransfer?.items ?? []);
  }
}
