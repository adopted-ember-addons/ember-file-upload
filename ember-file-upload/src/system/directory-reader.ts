// Reads dropped directories via the File and Directory Entries API
// (`webkitGetAsEntry`). This remains the only cross-browser way to
// traverse dropped folders — `DataTransferItem.getAsFileSystemHandle()`
// is Chromium-only.
// https://developer.mozilla.org/en-US/docs/Web/API/DataTransferItem/webkitGetAsEntry

interface FutureProofDataTransferItem extends DataTransferItem {
  // May replace `webkitGetAsEntry` in future browsers:
  // https://developer.mozilla.org/en-US/docs/Web/API/DataTransferItem/webkitGetAsEntry
  getAsEntry?: () => FileSystemEntry | null;
}

export interface FileWithPath {
  file: File;

  /**
   * Path of the file relative to the dropped directory, including the
   * directory name itself and the file name — e.g. `reports/q3/deck.pdf`.
   *
   * Empty string for files that were not dropped as part of a directory,
   * mirroring `File.webkitRelativePath` semantics.
   */
  relativePath: string;
}

function getEntry(item: FutureProofDataTransferItem): FileSystemEntry | null {
  return item.getAsEntry?.() ?? item.webkitGetAsEntry();
}

function isFileEntry(entry: FileSystemEntry): entry is FileSystemFileEntry {
  return entry.isFile;
}

function isDirectoryEntry(
  entry: FileSystemEntry,
): entry is FileSystemDirectoryEntry {
  return entry.isDirectory;
}

// `fullPath` is absolute from the drop root, e.g. `/folder/sub/file.txt`
function relativePathFor(entry: FileSystemEntry): string {
  return entry.fullPath.replace(/^\//, '');
}

function readFile(entry: FileSystemFileEntry): Promise<File | null> {
  return new Promise((resolve) => {
    entry.file(resolve, (error) => {
      // A single unreadable file should not fail the whole drop
      console.warn(
        `ember-file-upload: could not read dropped file ${entry.fullPath}`,
        error,
      );
      resolve(null);
    });
  });
}

function readAllEntries(
  directory: FileSystemDirectoryEntry,
): Promise<FileSystemEntry[]> {
  const reader = directory.createReader();
  const entries: FileSystemEntry[] = [];

  return new Promise((resolve) => {
    // Chromium returns at most 100 entries per `readEntries` call, so keep
    // reading until an empty chunk signals the end of the directory.
    const readChunk = () => {
      reader.readEntries(
        (chunk) => {
          if (chunk.length > 0) {
            entries.push(...chunk);
            readChunk();
          } else {
            resolve(entries);
          }
        },
        (error) => {
          // An unreadable directory should not fail the whole drop
          console.warn(
            `ember-file-upload: could not read dropped directory ${directory.fullPath}`,
            error,
          );
          resolve(entries);
        },
      );
    };
    readChunk();
  });
}

async function walkEntry(entry: FileSystemEntry): Promise<FileWithPath[]> {
  if (isFileEntry(entry)) {
    const file = await readFile(entry);
    return file ? [{ file, relativePath: relativePathFor(entry) }] : [];
  }

  if (isDirectoryEntry(entry)) {
    const children = await readAllEntries(entry);
    const nested = await Promise.all(children.map(walkEntry));
    return nested.flat();
  }

  return [];
}

/**
 * Read all files from dropped `DataTransferItem`s, recursing into
 * directories.
 *
 * Must be called synchronously from the `drop` event handler — browsers
 * neuter `DataTransferItem`s once the handler yields, so entries and
 * plain files are captured before this function first awaits.
 */
export function readDataTransferItems(
  items: DataTransferItem[],
): Promise<FileWithPath[]> {
  const captured = items.map((item) => ({
    entry: getEntry(item),
    file: item.getAsFile(),
  }));

  return Promise.all(
    captured.map(async ({ entry, file }): Promise<FileWithPath[]> => {
      if (entry && isDirectoryEntry(entry)) {
        return walkEntry(entry);
      }
      // Top-level plain file (or non-file item, which `getAsFile`
      // returns `null` for)
      return file ? [{ file, relativePath: '' }] : [];
    }),
  ).then((nested) => nested.flat());
}
