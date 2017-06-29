/*jshint node:true*/
/* global require, module */
var EmberAddon = require('ember-cli/lib/broccoli/ember-addon');
var YUIDoc = require('broccoli-yuidoc');
var mergeTrees = require('broccoli-merge-trees');

module.exports = function(defaults) {
  var app = new EmberAddon(defaults, {
    // Add options here
    fingerprint: {
      extensions: ['js', 'css', 'png', 'jpg', 'gif', 'map', 'eot', 'ttf', 'woff', 'woff2', 'svg'],
      prepend: '/ember-file-upload/'
    },
    sassOptions: {
      includePaths: ['tests/dummy/app']
    },
    svgJar: {
      strategy: 'inline',
      sourceDirs: ['tests/dummy/public/assets/images']
    }
  });

  var docs = new YUIDoc(['addon'], {
    destDir: 'docs',
    yuidoc: {
      parseOnly: true
    }
  });

  /*
    This build file specifies the options for the dummy test app of this
    addon, located in `/tests/dummy`
    This build file does *not* influence how the addon or the app using it
    behave. You most likely want to be modifying `./index.js` or app's build file
  */

  return mergeTrees([app.toTree(), docs]);
};
