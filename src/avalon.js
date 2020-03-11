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
    }

    state() {
        return this._state;
    }

    path() {
        return normalizePath(window.location.pathname);
    }

    mutate(name, callback) {
        this._mutators[name] = callback;
    }

    commit(name, data = null) {
        const callback = this._mutators[name];
        if (callback) {
            const oldState = this.state();
            const partialState = callback(oldState, data);
            this._state = createStateObject(oldState, partialState);
            return partialState;
        }
        return null;
    }
}

export default function avalon(state) {
    return new Avalon(state);
}
