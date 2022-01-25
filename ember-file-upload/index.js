'use strict';
const funnel = require('broccoli-funnel');

module.exports = {
  name: require('./package').name,
  included(app) {
    let config = app.project.config();

    this.appEnv = config.environment;
    this.mirageConfig = config['ember-cli-mirage'] || {};

    this._super.included.apply(this, arguments);
  },
  treeForAddon() {
    let tree = this._super.treeForAddon.apply(this, arguments);
    return this._shouldIncludeMirageHandler()
      ? tree
      : funnel(tree, { exclude: ['ember-file-upload/mirage/*'] });
  },
  _shouldIncludeMirageHandler() {
    if (process.env.EMBER_CLI_FASTBOOT) return false;

    let environment = this.appEnv;
    let enabledInProd =
      environment === 'production' && this.mirageConfig.enabled;
    let explicitExcludeFiles = this.mirageConfig.excludeFilesFromBuild;
    let shouldIncludeHandler =
      enabledInProd ||
      (environment &&
        environment !== 'production' &&
        explicitExcludeFiles !== true);

    return shouldIncludeHandler;
  },
};
