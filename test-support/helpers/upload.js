/*global triggerEvent, find */

export default function (selector, file, filename) {
  let input = findWithAssert(selector)[0];

  file.name = filename;

  // This hack is here since we can't mock out the
  // FileList API easily; we're taking advantage
  // that we can mutate the FileList DOM API at
  // runtime to allow us to push files into the <input>
  let files = [file];
  input.files.item = function (idx) {
    return files[idx];
  };
  input.files.size = files.length;

  return triggerEvent(selector, 'change');
}
