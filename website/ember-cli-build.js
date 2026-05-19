'use strict';

const EmberApp = require('ember-cli/lib/broccoli/ember-app');

module.exports = function (defaults) {
  const app = new EmberApp(defaults, {
    autoImport: {
      watchDependencies: ['ember-file-upload'],
    },
    babel: {
      plugins: [
        // ... any other plugins
        require.resolve('ember-concurrency/async-arrow-task-transform'),
      ],
    },
    // Add options here
  });

  app.import('node_modules/@picocss/pico/css/pico.min.css');
  app.import('node_modules/highlight.js/styles/atom-one-dark.css');

  return app.toTree();
};
