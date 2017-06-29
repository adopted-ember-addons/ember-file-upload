import Ember from 'ember';
import config from './config/environment';

const Router = Ember.Router.extend({
  location: config.locationType,
  rootURL: config.rootURL
});

Router.map(function() {
  this.route('docs', function () {
    this.route('component', { path: '/component/:id' });
    this.route('service', { path: '/service/:id' });
    this.route('system', { path: '/object/:id' });
    this.route('helper', { path: '/helper/:id' });
  });
  this.route('recipes');
  this.route('aws');
});

export default Router;
