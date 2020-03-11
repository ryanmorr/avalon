const TRAILING_SLASH_RE = /\/$/;

export function isPlainObject(obj) {
    if (!obj || typeof obj !== 'object') {
        return false;
    }
    const prototype = Object.getPrototypeOf(obj);
    return prototype === null || prototype === Object.getPrototypeOf({});
}

export function deepFreeze(obj) {
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

export function createStateObject(...sources) {
    return deepFreeze(Object.assign(Object.create(null), ...sources));
}

export function normalizePath(path) {
    path = path.trim();
    return path === '/' ? path : path.replace(TRAILING_SLASH_RE, '');
}
