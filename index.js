'use strict';

module.exports = {
  name: 'ember-plupload',

  included: function (app) {
    this._super.included(app);
    app.import('bower_components/plupload/js/plupload.full.min.js');
    app.import('bower_components/plupload/js/Moxie.swf', {
      destDir: 'assets'
    });
    app.import('bower_components/plupload/js/Moxie.xap', {
      destDir: 'assets'
    });
  }
};
