import htm from 'htm';
import { scheduleRender } from '@ryanmorr/schedule-render';
import { h, render } from 'carbon';
import { isEqual } from './util';

const dispatchers = new Map();

const html = htm.bind((nodeName, attributes, ...children) => {
    attributes = attributes || {};
    if (typeof nodeName === 'function') {
        attributes.children = children;
        return nodeName(html, attributes);
    }
    return h(nodeName, attributes, ...children);
});

function getEventDispatcher(app) {
    return (key, params = null) => {
        for (const [dispatcherKey, callback] of dispatchers) {
            if (dispatcherKey[0] === key && isEqual(params, dispatcherKey[1])) {
                return callback;
            }
        }
        const callback = (e) => {
            const dispatch = app._getDispatcher(key, params, (e instanceof Event) ? e : null);
            return dispatch ? dispatch() : null;
        };
        dispatchers.set([key, params], callback);
        return callback;
    };
}

export default class View {

    constructor(app, parent, callback) {
        if (typeof parent === 'string') {
            parent = document.querySelector(parent);
        }
        this.app = app;
        this.parent = parent;
        this.callback = callback;
        this.render();
    }

    render() {
        if (this.renderPromise) {
            return this.renderPromise;
        }
        return (this.renderPromise =  scheduleRender(() => {
            const vdom = this.callback(html, this.app.state(), getEventDispatcher(this.app));
            const element = render(this.parent, vdom);
            this.renderPromise = null;
            this.app.emit('render', element);
        }));
    }
}
