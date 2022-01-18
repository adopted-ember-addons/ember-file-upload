declare class FileReader {
  constructor(options: { label: string });

  readAsArrayBuffer(blob: Blob): Promise<ArrayBuffer>;
  readAsDataURL(blob: Blob): Promise<string>;
  readAsBinaryString(blob: Blob): Promise<string>;
  readAsText(blob: Blob): Promise<string>;
}

export = FileReader;
