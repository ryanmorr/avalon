import { createStateObject, normalizePath } from './util';

class Avalon {
    constructor(state = {}) {
        if ('title' in state) {
            document.title = state.title;
        } else {
            state.title = document.title;
        }
        this._state = createStateObject(state);
    }

    state() {
        return this._state;
    }

    path() {
        return normalizePath(window.location.pathname);
    }
}

export default function avalon(state) {
    return new Avalon(state);
}
