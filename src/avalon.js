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
        this.events = new Map();
        this.on('mutate', (name, oldState, newState) => {
            if (newState.title !== oldState.title) {
                document.title = newState.title;
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
        let callbacks = this.events.get(name);
        if (callbacks === undefined) {
            callbacks = [];
            this.events.set(name, callbacks);
        }
        callbacks.push(callback);
    }

    emit(name, ...args) {
        const callbacks = this.events.get(name);
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
