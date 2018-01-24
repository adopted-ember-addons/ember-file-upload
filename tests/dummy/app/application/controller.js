import ENV from '../config/environment';
import Ember from 'ember';

export default Ember.Controller.extend({
  displayNavigation: ENV.environment === 'production',
});
