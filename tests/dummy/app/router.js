import EmberRouter from '@ember/routing/router';

import config from './config/environment';

export default class Router extends EmberRouter {
  location = config.locationType;
  rootURL = config.rootURL;
}

Router.map(function () {
  // no routes yet
});

// import AddonDocsRouter, { docsRoute } from 'ember-cli-addon-docs/router';
// import config from 'dummy/config/environment';

// export default class Router extends AddonDocsRouter {
//   location = config.locationType;
//   rootURL = config.rootURL;
// }

// Router.map(function () {
//   docsRoute(this, function () {
//     this.route('recipes');
//     this.route('validation');
//     this.route('integration');
//     this.route('testing');
//     this.route('aws');
//   });

//   this.route('not-found', { path: '/*path' });
// });
