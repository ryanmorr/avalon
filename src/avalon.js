import { createStateObject, normalizePath } from './util';

class Avalon {
    constructor(state = {}) {
        if ('title' in state) {
            document.title = state.title;
        } else {
            state.title = document.title;
        }
        this._state = createStateObject(state);
        this._mutators = Object.create(null);
        this._events = new Map();
        this.on('mutate', (name, prevState, nextState) => {
            if (nextState.title !== prevState.title) {
                document.title = nextState.title;
            }
        });
    }

    state() {
        return this._state;
    }

    path() {
        return normalizePath(window.location.pathname);
    }

    on(name, callback) {
        let callbacks = this._events.get(name);
        if (callbacks === undefined) {
            callbacks = [];
            this._events.set(name, callbacks);
        }
        callbacks.push(callback);
        return () => {
            const callbacks = this._events.get(name);
            if (callbacks !== undefined) {
                for (let i = 0, len = callbacks.length; i < len; i++) {
                    if (callbacks[i] === callback) {
                        callbacks.splice(i, 1);
                        return;
                    }
                }
            }
        };
    }

    emit(name, ...args) {
        const callbacks = this._events.get(name);
        if (callbacks !== undefined && callbacks.length) {
            callbacks.forEach((callback) => callback(...args));
        }
    }

    mutate(name, callback) {
        this._mutators[name] = callback;
    }

    commit(name, data = null) {
        const callback = this._mutators[name];
        if (callback) {
            const prevState = this.state();
            const partialState = callback(prevState, data);
            this._state = createStateObject(prevState, partialState);
            this.emit('mutate', name, prevState, this._state, partialState);
            return partialState;
        }
        return null;
    }
}

export default function avalon(state) {
    return new Avalon(state);
}
