/*global triggerEvent, find */

export function upload(selector, file) {
  let upload = find(selector).closest('.file-upload');
  let input = findWithAssert('input[type=file]', upload)[0];

  // This hack is here since we can't mock out the
  // FileList API easily; we're taking advantage
  // that we can mutate the FileList DOM API at
  // runtime to allow us to push files into the <input>
  let files = [file];
  input.files.item = function (idx) {
    return files[idx];
  };
  input.files.size = files.length;

  return triggerEvent(input, 'change');
}
