class Avalon {
    constructor(state = {}) {
        if ('title' in state) {
            document.title = state.title;
        } else {
            state.title = document.title;
        }
        this._state = Object.assign(Object.create(null), state);
    }

    state() {
        return this._state;
    }
}

export default function avalon(state) {
    return new Avalon(state);
}
