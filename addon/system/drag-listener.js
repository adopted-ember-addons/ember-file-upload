import Ember from 'ember';

const { assert, run: { bind } } = Ember;

export default class {
  constructor() {
    this._listeners = Ember.A();
    this._entered = 0;
  }

  beginListening() {
    let handlers = this._handlers = {
      dragenter: bind(this, 'dragenter'),
      dragleave: bind(this, 'dragleave'),
      dragover:  bind(this, 'dragover'),
      drop:      bind(this, 'drop')
    };

    let body = document.body;
    body.addEventListener('dragenter', handlers.dragenter, {
      passive: true
    });
    body.addEventListener('dragleave', handlers.dragleave, {
      passive: true
    });
    body.addEventListener('dragover', handlers.dragover, {
      passive: false
    });
    body.addEventListener('drop', handlers.drop, {
      passive: false
    });
  }

  endListening() {
    let body = document.body;
    let handlers = this._handlers;
    body.removeEventListener('dragenter', handlers.dragenter, {
      passive: true
    });
    body.removeEventListener('dragleave', handlers.dragleave, {
      passive: true
    });
    body.removeEventListener('dragover', handlers.dragover, {
      passive: false
    });
    body.removeEventListener('drop', handlers.drop, {
      passive: false
    });
  }

  addEventListeners(selector, handlers) {
    if (this._listeners.length === 0) {
      this.beginListening();
    }

    // Listeners are ordered by most specific to least specific
    let insertAt = this._listeners.length;

    for (let i = 0, len = this._listeners.length; i < len; i++) {
      let listener = this._listeners[i];
      assert(`Cannot add multiple listeners for the same element ${selector}, ${listener.selector}`, document.querySelector(selector) !== document.querySelector(listener.selector));

      if (document.querySelector(`${listener.selector} ${selector}`)) {
        insertAt = i;
      }
    }

    this._listeners.splice(insertAt, 0, { selector, handlers });
  }

  removeEventListeners(selector) {
    this._listeners.removeObject(this._listeners.findBy('selector', selector));
    if (this._listeners.length === 0) {
      this.endListening();
    }
  }

  findListener(evt) {
    return this._listeners.find(function ({ selector }) {
      let element = document.querySelector(selector);
      return element === evt.target || element.contains(evt.target);
    });
  }

  dragenter(evt) {
    let listener = this.findListener(evt);

    // Trigger a dragleave because the listener that
    // matched isn't the same as the listener that was
    // previously called for a dragenter
    if (this._listener && listener !== this._listener) {
      this._listener.handlers.dragleave(evt);
    }

    if (listener && listener !== this._listener) {
      listener.handlers.dragenter(evt);
    }

    this._listener = listener;
    this._entered++;
  }

  dragleave(evt) {
    this._entered--;

    // Trigger a dragleave if the file leaves the browser
    if (this._entered === 0 && this._listener) {
      this._listener.handlers.dragleave(evt);
      this._listener = null;
    }
  }

  dragover(evt) {
    evt.preventDefault();
    evt.stopPropagation();
    let listener = this.findListener(evt);
    if (listener) {
      if (this._listener !== listener) {
        if (this._listener) {
          this._listener.handlers.dragleave(evt);
        }
        listener.handlers.dragenter(evt);
      }
      listener.handlers.dragover(evt);
    }
  }

  drop(evt) {
    this._entered = 0;
    evt.preventDefault();
    evt.stopPropagation();
    let listener = this.findListener(evt);
    if (listener) {
      listener.handlers.drop(evt);
    }
  }
}
