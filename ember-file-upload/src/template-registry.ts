import FileDropzoneComponent from './components/file-dropzone';
import FileQueueHelper from './helpers/file-queue';

export default interface Registry {
  FileDropzone: typeof FileDropzoneComponent;
  'file-queue': typeof FileQueueHelper;
}
