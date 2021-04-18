const numbers = new Uint8Array(16);

function random() {
  crypto.getRandomValues(numbers);
  return numbers;
}

function byteToHex(number) {
  return (number + 0x100).toString(16).substr(1);
}

function serialize(bytes) {
  let hex = [];
  for (let i = 0, len = bytes.length; i < len; i++) {
    hex[i] = byteToHex(bytes[i]);
  }

  return (
    hex.slice(0, 4).join('') +
    '-' +
    hex.slice(4, 6).join('') +
    '-' +
    hex.slice(6, 8).join('') +
    '-' +
    hex.slice(8, 10).join('') +
    '-' +
    hex.slice(10).join('')
  );
}

function uuid() {
  let numbers = random();

  numbers[6] = (numbers[6] & 0x0f) | 0x40;
  numbers[8] = (numbers[8] & 0x3f) | 0x80;

  return serialize(numbers);
}

uuid.short = function () {
  let result = uuid();

  return result.slice(0, 4) + result.slice(5, 6);
};

export default uuid;
