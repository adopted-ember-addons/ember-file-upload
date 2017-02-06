import uuid from 'ember-file-upload/system/uuid';

const MAP = 'map_' + uuid.short();
const KEYS = 'keys_' + uuid.short();

// Handle support for FormData#get in browsers that don't
// support it, only be done when mirage is included.
// Specifically, PhantomJS 👻
if (FormData.prototype.get == null) {
  const append = FormData.prototype.append;
  FormData.prototype.append = function (...args) {
    if (this[MAP] == null) { this[MAP] = {}; }
    if (this[KEYS] == null) { this[KEYS] = []; }
    this[MAP][args[0]] = args[1];
    this[KEYS].push(args[0]);
    return append.call(this, ...args);
  };

  FormData.prototype.get = function (key) {
    return this[MAP][key];
  };

  FormData.prototype.entries = function () {
    return new FormDataIterator(this);
  };
}

function FormDataIterator(formdata) {
  this.formdata = formdata;
  this.index = 0;}

FormDataIterator.prototype.next = function () {
  let keys = this.formdata[KEYS];
  let done = this.index >= keys.length;
  let key = keys[this.index++];
  return {
    done,
    value: [
      key,
      this.formdata[MAP][key]
    ]
  };
};
