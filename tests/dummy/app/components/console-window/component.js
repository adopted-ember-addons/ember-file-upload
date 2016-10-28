import Ember from 'ember';
import layout from '../app-window/template';

export default Ember.Component.extend({
  title: '',
  layout,
  classNames: ['window', 'console'],
});
