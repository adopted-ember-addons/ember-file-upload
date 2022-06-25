import { assert } from '@ember/debug';
import { cancel, next } from '@ember/runloop';
import { EmberRunTimer } from '@ember/runloop/types';
import {
  DragEventListener,
  QueuedDragEvent,
  DragListenerHandlers,
} from '../interfaces';
import { action } from '@ember/object';

export default class DragListener {
  _dropzone?: Element;

  _listeners: DragEventListener[] = [];
  _stack: DragEventListener[] = [];
  _listener: DragEventListener | null = null;

  // Keep a stack of deferred actions to take
  // on listeners to provide sane events.
  // `dragleave` / `dragenter` are called on the
  // same element back to back, which isn't what
  // we want to provide as an API.
  _events: QueuedDragEvent[] = [];

  _handlers: DragListenerHandlers = {};
  _handlersAttached = false;
  _scheduled: EmberRunTimer | null = null;

  constructor(dropzone: Element) {
    this._dropzone = dropzone;
  }

  beginListening() {
    if (!this._dropzone) return;

    this._dropzone.addEventListener('dragenter', this.dragenter, {
      passive: true,
    });
    this._dropzone.addEventListener('dragleave', this.dragleave, {
      passive: true,
    });
    this._dropzone.addEventListener('dragover', this.dragover, {
      passive: false,
    });
    this._dropzone.addEventListener('drop', this.drop, {
      passive: false,
    });

    this._handlersAttached = true;
  }

  endListening() {
    if (!this._dropzone) return;
    if (!this._handlersAttached) return;

    this._dropzone.removeEventListener('dragenter', this.dragenter);
    this._dropzone.removeEventListener('dragleave', this.dragleave);
    this._dropzone.removeEventListener('dragover', this.dragover);
    this._dropzone.removeEventListener('drop', this.drop);
  }

  addEventListeners(handlers: DragListenerHandlers) {
    if (!this._dropzone) return;

    if (this._listeners.length === 0) {
      this.beginListening();
    }

    // Listeners are ordered by most specific to least specific
    let insertAt = this._listeners.length;

    for (let i = 0, len = this._listeners.length; i < len; i++) {
      const listener = this._listeners[i];

      if (listener) {
        assert(
          `Cannot add multiple listeners for the same element ${this._dropzone}, ${listener.element}`,
          this._dropzone !== listener.element
        );

        if (listener.element.contains(this._dropzone)) {
          insertAt = i;
        }
      }
    }

    this._listeners.splice(insertAt, 0, { element: this._dropzone, handlers });
  }

  removeEventListeners() {
    this._listeners = this._listeners.filter(
      (listener) => listener.element !== this._dropzone
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

  @action
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

  @action
  dragleave(evt: DragEvent) {
    // Trigger a dragleave if the file leaves the browser
    if (this._stack.length) {
      this.scheduleEvent('dragleave', this._stack[0], evt);
      this._listener = null;
    }
  }

  @action
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
    eventName: QueuedDragEvent['eventName'],
    listener: QueuedDragEvent['listener'],
    event: QueuedDragEvent['event']
  ) {
    const isDuplicate = this._events.find((queuedEvent) => {
      return (
        queuedEvent.eventName === eventName && queuedEvent.listener === listener
      );
    });

    const cancelledEvent = this._events.find((queuedEvent) => {
      return (
        (queuedEvent.listener === listener &&
          queuedEvent.eventName === 'dragleave' &&
          eventName === 'dragenter') ||
        (queuedEvent.eventName === 'dragenter' && eventName === 'dragleave')
      );
    });

    if (cancelledEvent) {
      // Remove cancelled event
      this._events = this._events.filter((queuedEvent) => {
        return (
          queuedEvent.listener !== cancelledEvent.listener &&
          queuedEvent.eventName !== cancelledEvent.eventName &&
          queuedEvent.event !== cancelledEvent.event
        );
      });
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
      listener.handlers[eventName]?.(event);
    });

    this._events = [];
    this._scheduled = null;
  }

  @action
  drop(evt: DragEvent) {
    this._stack = [];
    this._events = [];
    this._scheduled = null;
    this._listener = null;

    evt.preventDefault();
    evt.stopPropagation();
    const listener = this.findListener(evt);
    listener?.handlers?.drop?.(evt);
  }
}
