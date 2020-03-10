import AddonDocsRouter, { docsRoute } from 'ember-cli-addon-docs/router';
import config from './config/environment';
import RouterScroll from 'ember-router-scroll';

const Router = AddonDocsRouter.extend(RouterScroll, {
  location: config.locationType,
  rootURL: config.rootURL
});

Router.map(function () {
  docsRoute(this, function() {
    this.route('recipes');
    this.route('integration');
    this.route('testing');
    this.route('aws');
  });

  this.route('not-found', { path: '/*path' });
});

export default Router;
