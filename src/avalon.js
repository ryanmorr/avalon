function isPlainObject(obj) {
    if (!obj || typeof obj !== 'object') {
        return false;
    }
    const prototype = Object.getPrototypeOf(obj);
    return prototype === null || prototype === Object.getPrototypeOf({});
}

function deepFreeze(obj) {
    if (obj == null || Object.isFrozen(obj)) {
        return obj;
    }
    Object.freeze(obj);
    if (Array.isArray(obj)) {
        obj.forEach((item) => deepFreeze(item));
    } else if (isPlainObject(obj)) {
        Object.getOwnPropertyNames(obj).forEach((prop) => deepFreeze(obj[prop]));
    }
    return obj;
}

function createStateObject(source) {
    return deepFreeze(Object.assign(Object.create(null), source));
}

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
}

export default function avalon(state) {
    return new Avalon(state);
}
