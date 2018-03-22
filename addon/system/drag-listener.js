import { assert } from '@ember/debug';
import { A } from '@ember/array';
import { cancel, next, bind } from '@ember/runloop';

export default class {
  constructor() {
    this._listeners = A();
    this._stack = [];

    // Keep a stack of deferred actions to take
    // on listeners to provide sane events.
    // `dragleave` / `dragenter` are called on the
    // same element back to back, which isn't what
    // we want to provide as an API.
    this._events = A();
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

  getEventSource(evt) {
    let types = evt.dataTransfer.types || [];
    let areSomeTypesFiles = false;
    for (let i = 0, len = types.length; i < len; i++) {
      if (types[i] === 'Files' ||
          types[i] === 'application/x-moz-file') {
        areSomeTypesFiles = true;
        break;
      }
    }
    return areSomeTypesFiles ? 'os' : 'web';
  }

  getDataTransferItemDetails(evt) {
    let itemDetails = [];
    for(let i = 0; i < evt.dataTransfer.items.length; i++) {
      let item = evt.dataTransfer.items[i];
      itemDetails.push({
        kind: item.kind,
        type: item.type
      })
    }
    return itemDetails;
  }

  dragenter(evt) {
    let listener = this.findListener(evt);
    let lastListener = this._stack[this._stack.length - 1];

    // Trigger dragleave on the previous listener
    if (lastListener) {
      this.scheduleEvent('dragleave', lastListener, evt);
    }

    if (listener) {
      this.scheduleEvent('dragenter', listener, {
        source: this.getEventSource(evt),
        dataTransfer: evt.dataTransfer,
        itemDetails: this.getDataTransferItemDetails(evt)
      });
    }
    this._listener = listener;
  }

  dragleave(evt) {
    // Trigger a dragleave if the file leaves the browser
    if (this._stack.length) {
      this.scheduleEvent('dragleave', this._stack[0], evt);
      this._listener = null;
    }
  }

  dragover(evt) {
    evt.preventDefault();
    evt.stopPropagation();

    let listener = this.findListener(evt);
    if (listener) {
      if (this._listener) {
        this.scheduleEvent('dragleave', this._listener, evt);
      }
      this.scheduleEvent('dragenter', listener, {
        source: this.getEventSource(evt),
        dataTransfer: evt.dataTransfer,
        itemDetails: this.getDataTransferItemDetails(evt)
      });
      if (this._stack.indexOf(listener) !== -1) {
        listener.handlers.dragover(evt);
      }
    }
    this._listener = listener;
  }

  scheduleEvent(eventName, listener, event) {
    let isDuplicate = this._events.find(function (queuedEvent) {
      return queuedEvent.eventName === eventName &&
        queuedEvent.listener === listener;
    });

    let cancelledEvent = this._events.find(function (queuedEvent) {
      return queuedEvent.listener === listener &&
        (queuedEvent.eventName === 'dragleave' && eventName === 'dragenter') ||
        (queuedEvent.eventName === 'dragenter' && eventName === 'dragleave');
    });

    if (cancelledEvent) {
      this._events.removeObject(cancelledEvent);
      if (this._events.length === 0) {
        cancel(this._scheduled);
        this._scheduled = null;
      }
    } else if (!isDuplicate) {
      this._events.push({ eventName, listener, event });
      if (!this._scheduled) {
        this._scheduled = next(this, 'sendEvents');
      }
    }
  }

  sendEvents() {
    this._events.forEach(({ eventName, listener, event }) => {
      if (eventName === 'dragenter') {
        this._stack.push(listener);
      } else if (eventName === 'dragleave') {
        this._stack.pop();
      }
      listener.handlers[eventName](event);
    });

    this._events = A();
    this._scheduled = false;
  }

  drop(evt) {
    this._stack = [];
    this._events = A();
    this._scheduled = false;
    this._listener = null;

    evt.preventDefault();
    evt.stopPropagation();
    let listener = this.findListener(evt);
    if (listener) {
      listener.handlers.drop(evt);
    }
  }
}
