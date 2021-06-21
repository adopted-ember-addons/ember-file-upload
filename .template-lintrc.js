'use strict';

module.exports = {
  extends: 'octane',

  overrides: [
    {
      files: ['addon/components/file-upload/template.hbs'],
      rules: {
        'no-action': false,
      },
    },
  ],
};
