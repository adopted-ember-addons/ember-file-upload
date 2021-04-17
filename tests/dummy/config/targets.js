'use strict';

const browsers = [
  'last 2 Chrome versions',
  'last 2 Firefox versions',
  'Firefox ESR',
  'last 2 Safari versions',
  // Last versions of Microsoft Edge are build on top of Chromium. But they are
  // not shipped yet to a significant number of users. Need to still support
  // Edge 18 explicitly until chromium-based Edge is shipped to all users.
  'Edge >= 18',
];

module.exports = {
  browsers,
};
