import htm from 'htm';
import { h, render as doRender } from '@ryanmorr/carbon';
import { scheduleRender } from '@ryanmorr/schedule-render';

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

function createStateObject(...sources) {
    return deepFreeze(Object.assign(Object.create(null), ...sources));
}

function isPath(str) {
    return str.charAt(0) === '/';
}

function isSameOrigin(path) {
    const url = new URL(path, window.location.toString());
    const loc = window.location;
    return loc.protocol === url.protocol &&
        loc.hostname === url.hostname &&
        (loc.port === url.port || loc.port === '' && (url.port == 80 || url.port == 443));
}

function normalizePath(path) {
    path = path.trim();
    return path === '/' ? path : path.replace(TRAILING_SLASH_RE, '');
}

function addOneOrMany(key, value, callback) {
    if (isPlainObject(key)) {
        for (const prop in key) {
            callback(prop, key[prop]);
        }
    } else {
        callback(key, value);
    }
}

function isEqual(a, b) {
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

function getRouteMatcher(path) {
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

class Avalon {
    constructor(state = {}) {
        if ('title' in state) {
            document.title = state.title;
        } else {
            state.title = document.title;
        }
        this._state = createStateObject(state);
        this._mutations = Object.create(null);
        this._actions = new Map();
        this._events = new Map();
        this._views = [];
        this._committer = this.commit.bind(this);
        this._dispatcher = this.dispatch.bind(this);
        this._dispatchers = new Map();
        this._emitter = this.emit.bind(this);
        const onEvent = this._handleEvent.bind(this);
        document.documentElement.addEventListener('click', onEvent, false);
        document.documentElement.addEventListener('submit', onEvent, false);
        this.html = htm.bind((nodeName, attributes, ...children) => {
            attributes = attributes || {};
            if (typeof nodeName === 'function') {
                attributes.children = children;
                return nodeName(this.html, attributes, this._getEventDispatcher());
            }
            return h(nodeName, attributes, ...children);
        });
        this.on('mutation', (name, nextState, prevState) => {
            if (nextState.title !== prevState.title) {
                document.title = nextState.title;
            }
            this._views.forEach((render) => render());
        });
    }

    use(plugin) {
        return plugin(this, this.state());
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
            callbacks = new Set();
            this._events.set(name, callbacks);
        }
        callbacks.add(callback);
        return () => this._events.get(name).delete(callback);
    }

    emit(name, ...args) {
        const callbacks = this._events.get(name);
        if (callbacks !== undefined && callbacks.size > 0) {
            callbacks.forEach((callback) => callback(...args));
        }
    }

    mutation(name, callback) {
        addOneOrMany(name, callback, (key, value) => {
            this._mutations[key] = value;
        });
    }

    commit(name, payload = null) {
        const callback = this._mutations[name];
        if (callback) {
            const prevState = this.state();
            const partialState = callback(prevState, payload);
            this._state = createStateObject(prevState, partialState);
            this.emit('mutation', name, this._state, prevState, partialState);
            return partialState;
        }
        return null;
    }

    action(name, callback) {
        addOneOrMany(name, callback, (key, value) => {
            this._actions.set(key, value);
        });
    }

    route(path, callback) {
        if (!this._onPopState) {
            this._onPopState = this._handlePopState.bind(this);
            window.addEventListener('popstate', this._onPopState, false);
        }
        addOneOrMany(path, callback, (key, value) => {
            this._actions.set(getRouteMatcher(key), value);
        });
    }

    dispatch(key = this.path(), params = null) {
        const dispatch = this._getDispatcher(key, params);
        return dispatch ? dispatch() : null;
    }

    navigate(path) {
        return this._modifyHistory(path, 'navigate');
    }

    redirect(path) {
        return this._modifyHistory(path, 'redirect');
    }

    view(parent, callback) {
        if (typeof parent === 'string') {
            parent = document.querySelector(parent);
        }
        let renderPromise;
        const render = () => {
            if (renderPromise) {
                return renderPromise;
            }
            return (renderPromise =  scheduleRender(() => {
                const vdom = callback(this.html, this.state(), this._getEventDispatcher());
                const element = doRender(parent, vdom);
                renderPromise = null;
                this.emit('render', element);
            }));
        };
        this._views.push(render);
        render();
    }

    _modifyHistory(path, type = 'navigate') {
        path = normalizePath(path);
        if (path === this.path()) {
            return;
        }
        const dispatch = this._getDispatcher(path);
        if (dispatch) {
            history[type === 'redirect' ? 'replaceState' : 'pushState'](null, '', path);
            this.emit('pathchange', path);
            return dispatch();
        }
        return null;
    }

    _getDispatcher(key, params = null, event = null) {
        const state = this.state();
        for (const [matcher, callback] of this._actions) {
            let route = null, action = null;
            if (isPath(key) && typeof matcher !== 'string') {
                const path = normalizePath(key);
                params = matcher(path);
                if (params) {
                    route = path;
                    if (Object.keys(params).length === 0) {
                        params = null;
                    }
                }
            } else if (matcher === key) {
                action = key;
            }
            if (action || route) {
                const data = {route, action, state, params, event};
                return () => {
                    const params = Object.assign({
                        commit: this._committer,
                        dispatch: this._dispatcher,
                        emit: this._emitter
                    }, data);
                    const value = (callback.length < 2) ?
                        callback(params) :
                        new Promise((resolve, reject) => callback(params, resolve, reject));
                    this.emit('dispatch', data, value);
                    return value;
                };
            }
        }
        return null;
    }

    _getEventDispatcher() {
        return (key, params = null) => {
            for (const [dispatcherKey, callback] of this._dispatchers) {
                if (dispatcherKey[0] === key && isEqual(params, dispatcherKey[1])) {
                    return callback;
                }
            }
            const callback = (e) => {
                const dispatch = this._getDispatcher(key, params, (e instanceof Event) ? e : null);
                return dispatch ? dispatch() : null;
            };
            this._dispatchers.set([key, params], callback);
            return callback;
        };
    }

    _handlePopState() {
        const path = this.path();
        this.dispatch(path);
        this.emit('pathchange', path);
    }

    _handleEvent(event) {
        if (event.defaultPrevented) {
            return;
        }
        let key;
        if (event.type === 'submit') {
            key = event.target.getAttribute('action');
        } else {
            if (event.button || event.ctrlKey || event.metaKey || event.altKey || event.shiftKey) {
                return;
            }
            const link = event.target.closest('a');
            if (!link) {
                return;
            }
            const isSvg = (typeof link.href === 'object') && link.href.constructor.name === 'SVGAnimatedString';
            if (link.getAttribute('target') === '_blank') {
                return;
            }
            if (link.getAttribute('rel') === 'external') {
                return;
            }
            if (link.hasAttribute('download')) {
                return;
            }
            if (!isSvg && !isSameOrigin(link)) {
                return;
            }
            key = isSvg ? link.href.baseVal : link.getAttribute('href');
            if (key.indexOf('mailto:') > -1) {
                return;
            }
        }
        if (!key) {
            return;
        }
        const isRoute = isPath(key);
        if (isRoute) {
            key = normalizePath(key);
        }
        if (isRoute && key === this.path()) {
            return;
        }
        const dispatch = this._getDispatcher(key, null, event);
        if (!dispatch) {
            return;
        }
        event.preventDefault();
        if (isRoute) {
            history.pushState(null, '', key);
            this.emit('pathchange', key);
        }
        dispatch();
    }
}

export default function avalon(state) {
    return new Avalon(state);
}
