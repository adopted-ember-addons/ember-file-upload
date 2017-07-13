import Ember from 'ember';
import config from './config/environment';

const Router = Ember.Router.extend({
  location: config.locationType,
  rootURL: config.rootURL
});

Router.map(function () {
  if (this.mount) {
    this.mount('addon-docs', { path: '/docs' });
  }

  this.route('recipes');
  this.route('aws');
});

export default Router;
