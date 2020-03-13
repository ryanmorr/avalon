import { createStateObject, isPath, isExternal, normalizePath, getRouteMatcher } from './util';

class Avalon {
    constructor(state = {}) {
        if ('title' in state) {
            document.title = state.title;
        } else {
            state.title = document.title;
        }
        this._state = createStateObject(state);
        this._mutators = Object.create(null);
        this._actions = new Map();
        this._events = new Map();
        this._committer = this.commit.bind(this);
        this._dispatcher = this.dispatch.bind(this);
        this._emitter = this.emit.bind(this);
        const onEvent = this._handleEvent.bind(this);
        document.documentElement.addEventListener('click', onEvent, false);
        document.documentElement.addEventListener('submit', onEvent, false);
        this.on('mutate', (name, prevState, nextState) => {
            if (nextState.title !== prevState.title) {
                document.title = nextState.title;
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

    action(name, callback) {
        this._actions.set(name, callback);
    }

    route(path, callback) {
        if (!this._onPopState) {
            this._onPopState = this._handlePopState.bind(this);
            window.addEventListener('popstate', this._onPopState, false);
        }
        this._actions.set(getRouteMatcher(path), callback);
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

    _modifyHistory(path, type = 'navigate') {
        path = normalizePath(path);
        if (path === this.path()) {
            return;
        }
        const dispatch = this._getDispatcher(path);
        if (dispatch) {
            history[type === 'redirect' ? 'replaceState' : 'pushState'](null, '', path);
            this.emit('pathchange', type, path);
            return dispatch();
        }
        return null;
    }

    _getDispatcher(key, params = null, event = null, target = null) {
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
                const data = {route, action, state, params, event, target};
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

    _handlePopState() {
        const path = this.path();
        this.dispatch(path);
        this.emit('pathchange', 'pop', path);
    }

    _handleEvent(event) {
        if (event.defaultPrevented) {
            return;
        }
        let target, key;
        if (event.type === 'click') {
            if (event.button || event.ctrlKey || event.metaKey || event.altKey || event.shiftKey) {
                return;
            }
            target = event.target.closest('a');
            if (!target) {
                return;
            }
            if (target.getAttribute('target') === '_blank') {
                return;
            }
            if (target.hasAttribute('download')) {
                return;
            }
            if (isExternal(target)) {
                return;
            }
            key = target.getAttribute('href');
        } else {
            target = event.target;
            key = target.getAttribute('action');
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
        const dispatch = this._getDispatcher(key, null, event, target);
        if (!dispatch) {
            return;
        }
        event.preventDefault();
        if (isRoute) {
            history.pushState(null, '', key);
            this.emit('pathchange', 'navigate', key);
        }
        dispatch();
    }
}

export default function avalon(state) {
    return new Avalon(state);
}
