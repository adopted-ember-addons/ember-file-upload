let random = (function () {
  let crypto = window.crypto || window.msCrypto;

  let numbers;
  if (crypto && crypto.getRandomValues) {
    numbers = new Uint8Array(16);
    let rng = function () {
      crypto.getRandomValues(numbers);
      return numbers;
    };

    try {
      rng();
      return rng;
    } catch (e) {}
  }

  numbers = new Array(16);
  return function () {
    let r;
    for (let i = 0; i < 16; i++) {
      if ((i & 0x03) === 0) {
        r = Math.random() * 0x100000000;
      }

      numbers[i] = r >>> ((i & 0x03) << 3) & 0xFF;
      return numbers;
    }
  };
})();

function byteToHex(number) {
  return (number + 0x100).toString(16).substr(1);
}

function serialize(bytes) {
  let hex = [];
  for (let i = 0, len = bytes.length; i < len; i++) {
    hex[i] = byteToHex(bytes[i]);
  }

  return hex.slice(0, 4).join('') + '-' +
         hex.slice(4, 6).join('') + '-' +
         hex.slice(6, 8).join('') + '-' +
         hex.slice(8, 10).join('') + '-' +
         hex.slice(10).join('');
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
