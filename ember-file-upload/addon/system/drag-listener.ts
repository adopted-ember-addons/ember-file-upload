import { assert } from '@ember/debug';
import { A } from '@ember/array';
import { cancel, next, bind } from '@ember/runloop';
import { EmberRunTimer } from '@ember/runloop/types';
import {
  DragEventListener,
  DragListenerEvent,
  DragListenerHandlers,
  SyntheticDragEvent,
} from 'ember-file-upload/interfaces';

export default class DragListener {
  _listeners: DragEventListener[] = [];
  _stack: DragEventListener[] = [];
  _listener: DragEventListener | null = null;

  // Keep a stack of deferred actions to take
  // on listeners to provide sane events.
  // `dragleave` / `dragenter` are called on the
  // same element back to back, which isn't what
  // we want to provide as an API.
  _events = A();

  _handlers: DragListenerHandlers = {};
  _handlersAttached = false;
  _scheduled: EmberRunTimer | null = null;

  beginListening() {
    const handlers = (this._handlers = {
      dragenter: bind(this, 'dragenter'),
      dragleave: bind(this, 'dragleave'),
      dragover: bind(this, 'dragover'),
      drop: bind(this, 'drop'),
    });

    const body = document.body;
    body.addEventListener('dragenter', handlers.dragenter, {
      passive: true,
    });
    body.addEventListener('dragleave', handlers.dragleave, {
      passive: true,
    });
    body.addEventListener('dragover', handlers.dragover, {
      passive: false,
    });
    body.addEventListener('drop', handlers.drop, {
      passive: false,
    });

    this._handlersAttached = true;
  }

  endListening() {
    const body = document.body;
    const handlers = this._handlers;

    if (!this._handlersAttached) return;

    if (handlers.dragenter) {
      body.removeEventListener('dragenter', handlers.dragenter);
    }
    if (handlers.dragleave) {
      body.removeEventListener('dragleave', handlers.dragleave);
    }
    if (handlers.dragover) {
      body.removeEventListener('dragover', handlers.dragover);
    }
    if (handlers.drop) {
      body.removeEventListener('drop', handlers.drop);
    }
  }

  addEventListeners(element: Element, handlers: DragListenerHandlers) {
    if (this._listeners.length === 0) {
      this.beginListening();
    }

    // Listeners are ordered by most specific to least specific
    let insertAt = this._listeners.length;

    for (let i = 0, len = this._listeners.length; i < len; i++) {
      const listener = this._listeners[i];

      if (listener) {
        assert(
          `Cannot add multiple listeners for the same element ${element}, ${listener.element}`,
          element !== listener.element
        );

        if (listener.element.contains(element)) {
          insertAt = i;
        }
      }
    }

    this._listeners.splice(insertAt, 0, { element, handlers });
  }

  removeEventListeners(element: Element) {
    this._listeners = this._listeners.filter(
      (listener) => listener.element !== element
    );
    if (this._listeners.length === 0) {
      this.endListening();
    }
  }

  findListener(evt: DragEvent) {
    return this._listeners.find(({ element }) => {
      return element === evt.target || element.contains(evt.target as Element);
    });
  }

  getEventSource(evt: DragEvent) {
    const types = evt.dataTransfer?.types ?? [];
    let areSomeTypesFiles = false;
    for (let i = 0, len = types.length; i < len; i++) {
      if (types[i] === 'Files' || types[i] === 'application/x-moz-file') {
        areSomeTypesFiles = true;
        break;
      }
    }
    return areSomeTypesFiles ? 'os' : 'web';
  }

  getDataTransferItemDetails(evt: DragEvent) {
    const itemDetails = [];

    if (evt.dataTransfer?.items) {
      for (let i = 0; i < evt.dataTransfer.items.length; i++) {
        const item = evt.dataTransfer.items[i];
        itemDetails.push({
          kind: item.kind,
          type: item.type,
        });
      }
    }

    return itemDetails;
  }

  dragenter(evt: DragEvent) {
    const listener = this.findListener(evt);
    const lastListener = this._stack[this._stack.length - 1];

    // Trigger dragleave on the previous listener
    if (lastListener) {
      this.scheduleEvent('dragleave', lastListener, evt);
    }

    if (listener) {
      this.scheduleEvent('dragenter', listener, {
        source: this.getEventSource(evt),
        dataTransfer: evt.dataTransfer,
        itemDetails: this.getDataTransferItemDetails(evt),
      });
    }
    this._listener = listener ?? null;
  }

  dragleave(evt: DragEvent) {
    // Trigger a dragleave if the file leaves the browser
    if (this._stack.length) {
      this.scheduleEvent('dragleave', this._stack[0], evt);
      this._listener = null;
    }
  }

  dragover(evt: DragEvent) {
    evt.preventDefault();
    evt.stopPropagation();

    const listener = this.findListener(evt);
    if (listener) {
      if (this._listener) {
        this.scheduleEvent('dragleave', this._listener, evt);
      }
      this.scheduleEvent('dragenter', listener, {
        source: this.getEventSource(evt),
        dataTransfer: evt.dataTransfer,
        itemDetails: this.getDataTransferItemDetails(evt),
      });
      if (this._stack.includes(listener)) {
        listener.handlers?.dragover?.(evt);
      }
    }
    this._listener = listener ?? null;
  }

  scheduleEvent(
    eventName: DragListenerEvent['eventName'],
    listener: DragListenerEvent['listener'],
    event: DragListenerEvent['event'] | SyntheticDragEvent
  ) {
    const isDuplicate = this._events.find(function (
      queuedEvent: DragListenerEvent
    ) {
      return (
        queuedEvent.eventName === eventName && queuedEvent.listener === listener
      );
    });

    const cancelledEvent = this._events.find(function (
      queuedEvent: DragListenerEvent
    ) {
      return (
        (queuedEvent.listener === listener &&
          queuedEvent.eventName === 'dragleave' &&
          eventName === 'dragenter') ||
        (queuedEvent.eventName === 'dragenter' && eventName === 'dragleave')
      );
    });

    if (cancelledEvent) {
      this._events.removeObject(cancelledEvent);
      if (this._events.length === 0) {
        if (this._scheduled) {
          cancel(this._scheduled);
        }
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
    this._scheduled = null;
  }

  drop(evt: DragEvent) {
    this._stack = [];
    this._events = A();
    this._scheduled = null;
    this._listener = null;

    evt.preventDefault();
    evt.stopPropagation();
    const listener = this.findListener(evt);
    listener?.handlers?.drop?.(evt);
  }
}
