import { scheduleRender } from '@ryanmorr/schedule-render';
import { render } from 'carbon';

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
            const vdom = this.callback(this.app.html, this.app.state(), this.app._getEventDispatcher());
            const element = render(this.parent, vdom);
            this.renderPromise = null;
            this.app.emit('render', element);
        }));
    }
}
