const TRAILING_SLASH_RE = /\/$/;

function isNumeric(value) {
    return !Number.isNaN(parseFloat(value)) && isFinite(value);
}

function coerce(value) {
    if (value === 'true') {
        return true;
    }
    if (value === 'false') {
        return false;
    }
    if (value === 'undefined') {
        return null;
    }
    if (isNumeric(value)) {
        return Number(value);
    }
    return value;
}

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

export function createStateObject(...sources) {
    return deepFreeze(Object.assign(Object.create(null), ...sources));
}

export function isPath(str) {
    return str.charAt(0) === '/';
}

export function isSameOrigin(path) {
    const url = new URL(path, window.location.toString());
    const loc = window.location;
    return loc.protocol === url.protocol &&
        loc.hostname === url.hostname &&
        (loc.port === url.port || loc.port === '' && (url.port == 80 || url.port == 443));
}

export function normalizePath(path) {
    path = path.trim();
    return path === '/' ? path : path.replace(TRAILING_SLASH_RE, '');
}

export function addOneOrMany(key, value, callback) {
    if (isPlainObject(key)) {
        for (const prop in key) {
            callback(prop, key[prop]);
        }
    } else {
        callback(key, value);
    }
}

export function isEqual(a, b) {
    if (a === b) {
        return true;
    }
    if (a === null || b === null) {
        return false;
    }
    const typeA = Object.prototype.toString.call(a);
    const typeB = Object.prototype.toString.call(b);
    if (typeA != typeB) {
        return false;
    }
    switch (typeA) {
        case '[object Date]':
        case '[object Number]':
            return +a == +b || (+a != +a && +b != +b);
        case '[object Function]':
        case '[object String]':
        case '[object Boolean]':
            return '' + a == '' + b;
        case '[object Array]':
            if (a.length != b.length) {
                return false;
            }
            for (let i = 0; i < a.length; i++) {
                if (!isEqual(a[i], b[i])) {
                    return false;
                }
            }
            return true;
        case '[object Object]': {
            const aKeys = Object.keys(a);
            const bKeys = Object.keys(b);
            return aKeys.length == bKeys.length && aKeys.every((key) => isEqual(a[key], b[key]));
        }
        default:
            return false;
    }
}

export function getRouteMatcher(path) {
    const keys = [];
    const pattern = path.split('/').map((part) => {
        if (!part) {
            return part;
        }
        const length = part.length;
        const code = part.charCodeAt(0);
        if (code === 42) {
            keys.push('wildcard');
            return '/(.*)';
        } else if (code === 58) {
            const optional = part.charCodeAt(length - 1) === 63;
            keys.push(part.substring(1, optional ? length - 1 : length));
            if (optional) {
                return '(?:/([^/]+?))?';
            }
            return '/([^/]+?)';
        }
        return '/' + part;
    });
    const regex = new RegExp('^' + pattern.join('') + '/?$', 'i');
    return (path) => {
        const matches = regex.exec(path);
        if (matches && matches[0]) {
            return matches
                .slice(1)
                .map(decodeURI)
                .map(coerce)
                .reduce((map, value, i) => {
                    map[keys[i]] = value;
                    return map;
                }, {});
        }
        return null;
    };
}
