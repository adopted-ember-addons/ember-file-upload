function flatten(array) {
  var flattened = [];
  for (let i = 0, len = array.length; i < len; i++) {
    let value = array[i];
    if (Array.isArray(value)) {
      flattened.push(...flatten(value));
    } else {
      flattened.push(value);
    }
  }
  return flattened;
}

export default flatten;
