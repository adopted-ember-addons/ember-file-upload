var trim;

if (String.prototype.trim) {
  trim = function (string) {
    return (string || '').trim();
  };
} else {
  // Make sure we trim BOM and NBSP
  var rtrim = /^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g;
  trim = function (string) {
    return (string || '').replace(rtrim, '');
  };
}

export default trim;
