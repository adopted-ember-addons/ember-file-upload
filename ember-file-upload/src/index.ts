import UploadFile from './upload-file';
import Queue from './queue';
import HTTPRequest from './system/http-request';
import DataTransferWrapper from './system/data-transfer-wrapper';
import UploadFileReader from './system/upload-file-reader';
import { FileSource, FileState } from './interfaces';
import { DEFAULT_QUEUE } from './services/file-queue';
import uploadHandler from './mirage/upload-handler';

export {
  // Public API classes
  Queue,
  UploadFile,
  // Mirage handler
  uploadHandler,
  // Undocumented classes
  HTTPRequest,
  DataTransferWrapper,
  UploadFileReader,
  // Enums
  FileSource,
  FileState,
  // Constants
  DEFAULT_QUEUE,
};
