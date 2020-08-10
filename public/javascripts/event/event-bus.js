export class EventBus {
    static _eventListeners = {};

    static subscribe(event, listener) {
        let listeners = this._eventListeners[event];
        if (!listeners) {
            this._eventListeners[event] = listeners = [];
        }
        listeners.push(listener);
    }

    static unsubscribe(event, listener) {
        let listeners = this._eventListeners[event];
        if (listeners) {
            for (let i = 0; i < listeners.length; i++) {
                if (listeners[i] === listener) {
                    listeners.splice(i, 1);
                    break;
                }
            }
        }
    }

    static post(event) {
        const listeners = this._eventListeners[event.name];
        if (listeners) {
            for (const listener of listeners) {
                listener(event);
            }
        }
    }
}
