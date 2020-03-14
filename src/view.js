import htm from 'htm';
import { scheduleRender } from '@ryanmorr/schedule-render';
import { h, render } from 'carbon';

const html = htm.bind((nodeName, attributes, ...children) => {
    attributes = attributes || {};
    if (typeof nodeName === 'function') {
        attributes.children = children;
        return nodeName(html, attributes);
    }
    return h(nodeName, attributes, ...children);
});

function getDispatcher(app) {
    return (key) => (e) => {
        let event = null, target = null;
        if (e instanceof Event) {
            event = e;
            target = e.target;
        }
        const dispatch = app._getDispatcher(key, null, event, target);
        return dispatch ? dispatch() : null;
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
            const vdom = this.callback(html, this.app.state(), getDispatcher(this.app));
            const element = render(this.parent, vdom);
            this.renderPromise = null;
            this.app.emit('render', element);
        }));
    }
}
