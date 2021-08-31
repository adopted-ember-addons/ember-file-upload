'use strict';

module.exports = {
  root: true,
  parser: 'babel-eslint',
  parserOptions: {
    ecmaVersion: 2018,
    sourceType: 'module',
    ecmaFeatures: {
      legacyDecorators: true,
    },
  },
  plugins: ['ember'],
  extends: [
    'eslint:recommended',
    'plugin:ember/recommended',
    'plugin:prettier/recommended',
  ],
  env: {
    browser: true,
  },
  globals: {
    // Mirage server
    server: true,
  },
  rules: {},
  overrides: [
    // components that need updating to glimmer/native
    {
      files: [
        'addon/components/base-component.js',
        'addon/components/file-dropzone/component.js',
        'addon/components/file-upload/component.js',
      ],
      rules: {
        'ember/no-actions-hash': 'off',
        'ember/no-classic-components': 'off',
        'ember/no-classic-classes': 'off',
        'ember/no-component-lifecycle-hooks': 'off',
        'ember/require-tagless-components': 'off',
      },
    },
    // node files
    {
      files: [
        '.eslintrc.js',
        '.prettierrc.js',
        '.template-lintrc.js',
        'ember-cli-build.js',
        'index.js',
        'testem.js',
        'blueprints/*/index.js',
        'config/**/*.js',
        'tests/dummy/config/**/*.js',
      ],
      excludedFiles: [
        'addon/**',
        'addon-test-support/**',
        'app/**',
        'tests/dummy/app/**',
      ],
      parserOptions: {
        sourceType: 'script',
      },
      env: {
        browser: false,
        node: true,
      },
      plugins: ['node'],
      extends: ['plugin:node/recommended'],
    },
  ],
};
