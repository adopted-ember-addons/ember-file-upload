/* eslint-env node */
module.exports = {
  globals: {
    server: true,
  },
  root: true,
  parserOptions: {
    ecmaVersion: 2017,
    sourceType: 'module'
  },
  plugins: [
    'ember'
  ],
  extends: [
    'eslint:recommended',
    'plugin:ember/recommended'
  ],
  env: {
    browser: true
  },
  globals: {
    // Mirage server
    server: true
  },
  rules: {
    'ember/no-jquery': 2,
    'comma-dangle': [1, 'never'],
    'no-debugger': 2,
    'no-dupe-args': 2,
    'no-dupe-keys': 2,
    'no-duplicate-case': 2,
    'no-empty': 2,
    'no-irregular-whitespace': 2,
    'no-multi-spaces': 0,
    'complexity': [1, 7],
    'dot-location': [2, 'property'],
    'eqeqeq': [2, 'allow-null'],
    'guard-for-in': 2,
    'no-caller': 2,
    'no-eval': 2,
    'no-extra-bind': 2,
    'no-implied-eval': 2,
    'yoda': [2, 'never', {
      'exceptRange': true
    }],
    'brace-style': [2, '1tbs', { 'allowSingleLine': true }],
    'camelcase': 0,
    'comma-spacing': 0,
    'comma-style': [2, 'last'],
    'indent': [2, 2],
    'key-spacing': [2, {
      'beforeColon': false,
      'afterColon': true
    }],
    'linebreak-style': [2, 'unix'],
    'max-nested-callbacks': [2, 3],
    'new-cap': 0,
    'no-lonely-if': 2,
    'no-trailing-spaces': 2,
    'no-underscore-dangle': 0,
    'one-var': [2, {
      'uninitialized': 'always',
      'initialized': 'never'
    }],
    'quotes': [2, 'single', {'allowTemplateLiterals': true }],
    'semi': [2, 'always'],
    'keyword-spacing': 2
  },
  overrides: [
    // node files
    {
      files: [
        '.template-lintrc.js',
        'ember-cli-build.js',
        'index.js',
        'testem.js',
        'blueprints/*/index.js',
        'config/**/*.js',
        'tests/dummy/config/**/*.js'
      ],
      excludedFiles: [
        'addon/**',
        'addon-test-support/**',
        'app/**',
        'tests/dummy/app/**'
      ],
      parserOptions: {
        sourceType: 'script',
        ecmaVersion: 2015
      },
      env: {
        browser: false,
        node: true
      },
      plugins: ['node'],
      rules: Object.assign({}, require('eslint-plugin-node').configs.recommended.rules, {
        // add your custom rules and overrides for node files here
      })
    }
  ]
};
