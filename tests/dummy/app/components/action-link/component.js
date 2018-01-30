import Component from '@ember/component';
import { get } from '@ember/object';
import layout from './template';

const RETURN = 13;

export default Component.extend({

  layout,

  tagName: 'a',
  classNames: ['action-link'],
  tabindex: 0,

  attributeBindings: ['disabled', 'tabindex'],

  click() {
    get(this, 'action')();
  },

  keyUp(evt) {
    let code = evt.keyCode || evt.which;
    switch (code) {
    case RETURN:
      get(this, 'action')();
    }
  }
});
