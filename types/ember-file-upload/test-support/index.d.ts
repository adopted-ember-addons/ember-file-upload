/**
 * Triggers a change event on a FileUpload input with files.
 *
 * All files must be HTML5 File objects.
 *
 * A single file, or multiple files may be passed as arguments.
 *
 * ```
 * // A single file
 * const file = new File([], 'dingus.txt');
 * await selectFiles('.file-upload input', file);
 * ```
 *
 * ```
 * // Multiple files
 * const file1 = new File([], 'dingus1.txt');
 * const file2 = new File([], 'dingus2.txt');
 * await selectFiles('.file-upload input', file1, file2);
 * ```
 *
 * @param selector DOM selector for a FileUpload input
 * @param files One or more File objects
 * @returns Returns Promise<void> which resolves when the application is settled.
 */
export function selectFiles(selector: string, files: File): Promise<void>;

/**
 * Triggers dragenter, dragover, and drop events on a FileDropzone with files.
 *
 * All files must be HTML5 File objects.
 *
 * A single file, or multiple files may be passed as arguments.
 *
 * ```
 * // A single file
 * const file = new File([], 'dingus.txt');
 * await dragAndDrop('.file-dropzone', file);
 * ```
 *
 * ```
 * // Multiple files
 * const file1 = new File([], 'dingus1.txt');
 * const file2 = new File([], 'dingus2.txt');
 * await dragAndDrop('.file-dropzone', file1, file2);
 * ```
 *
 * @param selector DOM selector for a FileUpload input
 * @param files One or more File objects
 * @returns Returns Promise<void> which resolves when the application is settled.
 */
export function dragAndDrop(selector: string, files: File): Promise<void>;

/**
 * Triggers a dragenter event on a FileDropzone with files.
 *
 * All files must be HTML5 File objects.
 *
 * A single file, or multiple files may be passed as arguments.
 *
 * ```
 * // A single file
 * const file = new File([], 'dingus.txt');
 * await dragEnter('.file-dropzone', file);
 * ```
 *
 * ```
 * // Multiple files
 * const file1 = new File([], 'dingus1.txt');
 * const file2 = new File([], 'dingus2.txt');
 * await dragEnter('.file-dropzone', file1, file2);
 * ```
 *
 * @param selector DOM selector for a FileUpload input
 * @param files One or more File objects
 * @returns Returns Promise<void> which resolves when the application is settled.
 */
export function dragEnter(selector: string, files: File): Promise<void>;

/**
 * Triggers a dragleave event on a FileDropzone with files.
 *
 * All files must be HTML5 File objects.
 *
 * A single file, or multiple files may be passed as arguments.
 *
 * ```
 * // A single file
 * const file = new File([], 'dingus.txt');
 * await dragLeave('.file-dropzone', file);
 * ```
 *
 * ```
 * // Multiple files
 * const file1 = new File([], 'dingus1.txt');
 * const file2 = new File([], 'dingus2.txt');
 * await dragLeave('.file-dropzone', file1, file2);
 * ```
 *
 * @param selector DOM selector for a FileUpload input
 * @param files One or more File objects
 * @returns Returns Promise<void> which resolves when the application is settled.
 */
export function dragLeave(selector: string, files: File): Promise<void>;
