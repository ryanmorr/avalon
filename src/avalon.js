import htm from 'htm';
import { h, render as doRender } from '@ryanmorr/carbon';
import scheduleRender from '@ryanmorr/schedule-render';

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
    
    #state;
    #mutations;
    #actions;
    #events;
    #dispatchers;
    #views;
    #html;
    #methods;

    constructor(state = {}) {
        if ('title' in state) {
            document.title = state.title;
        } else {
            state.title = document.title;
        }
        this.#state = createStateObject(state);
        this.#mutations = Object.create(null);
        this.#actions = new Map();
        this.#events = new Map();
        this.#dispatchers = new Map();
        this.#views = [];
        this.#methods = {
            commit: this.commit.bind(this),
            dispatch: this.dispatch.bind(this),
            redirect: this.redirect.bind(this),
            navigate: this.navigate.bind(this),
            emit: this.emit.bind(this)
        };
        const onEvent = this.#handleEvent.bind(this);
        document.documentElement.addEventListener('click', onEvent, false);
        document.documentElement.addEventListener('submit', onEvent, false);
        this.#html = htm.bind((nodeName, attributes, ...children) => {
            attributes = attributes || {};
            if (typeof nodeName === 'function') {
                attributes.children = children;
                return nodeName(this.#html, attributes, this.#getEventDispatcher());
            }
            return h(nodeName, attributes, ...children);
        });
        this.on('mutation', (name, nextState, prevState) => {
            if (nextState.title !== prevState.title) {
                document.title = nextState.title;
            }
            this.#views.forEach((render) => render());
        });
    }

    use(plugin) {
        return plugin(this, this.state());
    }

    state() {
        return this.#state;
    }

    path() {
        return normalizePath(window.location.pathname);
    }

    on(name, callback) {
        let callbacks = this.#events.get(name);
        if (callbacks === undefined) {
            callbacks = new Set();
            this.#events.set(name, callbacks);
        }
        callbacks.add(callback);
        return () => this.#events.get(name).delete(callback);
    }

    emit(name, ...args) {
        const callbacks = this.#events.get(name);
        if (callbacks !== undefined && callbacks.size > 0) {
            callbacks.forEach((callback) => callback(...args));
        }
    }

    mutation(name, callback) {
        addOneOrMany(name, callback, (key, value) => {
            this.#mutations[key] = value;
        });
    }

    commit(name, payload = null) {
        const callback = this.#mutations[name];
        if (callback) {
            const prevState = this.state();
            const partialState = callback(prevState, payload);
            this.#state = createStateObject(prevState, partialState);
            this.emit('mutation', name, this.#state, prevState, partialState);
            return partialState;
        }
        return null;
    }

    action(name, callback) {
        addOneOrMany(name, callback, (key, value) => {
            this.#actions.set(key, value);
        });
    }

    route(path, callback) {
        if (!this.#methods.onPopState) {
            this.#methods.onPopState = this.#handlePopState.bind(this);
            window.addEventListener('popstate', this.#methods.onPopState, false);
        }
        addOneOrMany(path, callback, (key, value) => {
            this.#actions.set(getRouteMatcher(key), value);
        });
    }

    dispatch(key = this.path(), params = null) {
        const dispatch = this.#getDispatcher(key, params);
        return dispatch ? dispatch() : null;
    }

    navigate(path) {
        return this.#modifyHistory(path, 'navigate');
    }

    redirect(path) {
        return this.#modifyHistory(path, 'redirect');
    }

    view(parent, callback) {
        let renderPromise;
        const render = () => {
            if (renderPromise) {
                return renderPromise;
            }
            return (renderPromise =  scheduleRender(() => {
                const vdom = callback(this.#html, this.state(), this.#getEventDispatcher());
                const element = doRender(parent, vdom);
                renderPromise = null;
                this.emit('render', element);
            }));
        };
        this.#views.push(render);
        render();
    }

    #modifyHistory(path, type = 'navigate') {
        path = normalizePath(path);
        if (path === this.path()) {
            return;
        }
        const dispatch = this.#getDispatcher(path);
        if (dispatch) {
            history[type === 'redirect' ? 'replaceState' : 'pushState'](null, '', path);
            this.emit('pathchange', path);
            return dispatch();
        }
        return null;
    }

    #getDispatcher(key, params = null, event = null) {
        for (const [matcher, callback] of this.#actions) {
            let type;
            if (isPath(key) && typeof matcher !== 'string') {
                const path = normalizePath(key);
                params = matcher(path);
                if (params) {
                    type = 'route';
                    if (Object.keys(params).length === 0) {
                        params = null;
                    }
                }
            } else if (matcher === key) {
                type = 'action';
            }
            if (type) {
                return () => {
                    const data = {
                        params,
                        event,
                        state: this.state(),
                        commit: this.#methods.commit,
                        dispatch: this.#methods.dispatch,
                        navigate: this.#methods.navigate,
                        redirect: this.#methods.redirect,
                        emit: this.#methods.emit
                    };
                    if (type === 'route') {
                        data.path = key;
                    }
                    const value = (callback.length < 2) ? callback(data) : new Promise((resolve, reject) => callback(data, resolve, reject));
                    this.emit('dispatch', type, key, this.state(), params, event, value);
                    return value;
                };
            }
        }
        return null;
    }

    #getEventDispatcher() {
        return (key, params = null) => {
            for (const [dispatcherKey, callback] of this.#dispatchers) {
                if (dispatcherKey[0] === key && isEqual(params, dispatcherKey[1])) {
                    return callback;
                }
            }
            const callback = (e) => {
                const dispatch = this.#getDispatcher(key, params, (e instanceof Event) ? e : null);
                return dispatch ? dispatch() : null;
            };
            this.#dispatchers.set([key, params], callback);
            return callback;
        };
    }

    #handlePopState() {
        const path = this.path();
        this.dispatch(path);
        this.emit('pathchange', path);
    }

    #handleEvent(event) {
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
        const dispatch = this.#getDispatcher(key, null, event);
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
