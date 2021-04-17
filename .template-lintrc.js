'use strict';

module.exports = {
  extends: 'octane',

  overrides: [
    {
      files: [
        'addon/components/file-dropzone/template.hbs',
        'addon/components/file-upload/template.hbs',
        'tests/dummy/app/templates/application.hbs',
        'tests/dummy/app/templates/index.hbs',
        'tests/dummy/app/templates/not-found.hbs',
      ],
      rules: {
        'no-curly-component-invocation': false,
      },
    },
    {
      files: ['addon/components/file-upload/template.hbs'],
      rules: {
        'no-action': false,
      },
    },
  ],
};
