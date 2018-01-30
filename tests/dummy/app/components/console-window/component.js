import Component from '@ember/component';
import layout from '../app-window/template';

export default Component.extend({
  title: '',
  layout,
  classNames: ['window', 'console'],
});
