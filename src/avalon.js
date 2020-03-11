class Avalon {
    constructor(state = {}) {
        this._state = Object.assign(Object.create(null), state);
    }

    state() {
        return this._state;
    }
}

export default function avalon(state) {
    return new Avalon(state);
}
