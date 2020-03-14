import avalon from '../../src/avalon';

describe('view', () => {
    it('should immediately render a view', (testDone) => {
        const app = avalon({foo: 1});

        const root = document.createElement('div');
        const callback = sinon.spy((html, state) => html`<div>${state.foo}</div>`);
        app.view(root, callback);

        requestAnimationFrame(() => {
            expect(callback.callCount).to.equal(1);
            expect(root.innerHTML).to.equal('<div>1</div>');
            testDone();
        });
    });

    it('should support a selector string for a parent element', (testDone) => {
        const app = avalon();

        const root = document.createElement('div');
        root.id = 'foo';
        document.body.appendChild(root);
        app.view('#foo', (html) => html`<div></div>`);

        requestAnimationFrame(() => {
            expect(root.innerHTML).to.equal('<div></div>');
            root.remove();
            testDone();
        });
    });

    it('should update a view when the state changes', (testDone) => {
        const app = avalon({foo: 1});

        const root = document.createElement('div');
        const callback = sinon.spy((html, state) => html`<div>${state.foo}</div>`);
        app.view(root, callback);

        app.mutate('foo', () => ({foo: 2}));

        requestAnimationFrame(() => {
            expect(callback.callCount).to.equal(1);
            expect(root.innerHTML).to.equal('<div>1</div>');

            app.commit('foo');
            requestAnimationFrame(() => {
                expect(callback.callCount).to.equal(2);
                expect(root.innerHTML).to.equal('<div>2</div>');
                testDone();
            });
        });
    });

    it('should provide the current state and dispatch function to the view callback function', (testDone) => {
        const app = avalon();

        const fooSpy = sinon.spy(() => ({}));
        app.action('foo', fooSpy);

        const callback = sinon.spy((html, state, dispatch) => {
            expect(state).to.equal(app.state());
            expect(dispatch).to.be.a('function');

            const foo = dispatch('foo');
            expect(foo).to.be.a('function');
            foo();
            expect(fooSpy.callCount).to.equal(1);

            return html`<div></div>`;
        });

        const root = document.createElement('div');
        app.view(root, callback);

        requestAnimationFrame(() => {
            expect(callback.callCount).to.equal(1);
            testDone();
        });
    });

    it('should provide the event object and target element if the dispatch function is used for an event listener', (testDone) => {
        const app = avalon();
        let eventObject, button;

        app.action('foo', ({event, target}) => {
            expect(event).to.equal(eventObject);
            expect(target).to.equal(event.target);
            expect(target).to.equal(button);
            testDone();
        });

        const root = document.createElement('div');
        app.view(root, (html, state, dispatch) => html`<button onclick=${dispatch('foo')}></button>`);

        requestAnimationFrame(() => {
            button = root.querySelector('button');
            eventObject = new Event('click');
            button.dispatchEvent(eventObject);
        });
    });
    
    it('should schedule a frame when the views are patched', (testDone) => {
        const requestSpy = sinon.spy(window, 'requestAnimationFrame');

        const app = avalon();

        const root = document.createElement('div');
        app.view(root, (html) => html`<div></div>`);

        expect(requestSpy.callCount).to.equal(1);

        requestAnimationFrame(() => {
            requestSpy.restore();
            testDone();
        });
    });

    it('should invoke the view callback once per frame', (testDone) => {
        const app = avalon();

        let n = 1;
        app.mutate('foo', () => ({foo: n++}));

        const root = document.createElement('div');
        const callback = sinon.spy((html) => html`<div></div>`);
        app.view(root, callback);

        app.commit('foo');
        app.commit('foo');
        app.commit('foo');

        requestAnimationFrame(() => {
            expect(callback.callCount).to.equal(1);
            testDone();
        });
    });

    it('should emit the render event when a view has been rendered', (testDone) => {
        const app = avalon({foo: 1});
        app.mutate('foo', () => ({foo: 2}));

        const root = document.createElement('div');

        const renderSpy = sinon.spy((element) => {
            expect(element).to.equal(root.firstChild);
            expect(root.innerHTML).to.equal('<div></div>');
        });
        app.on('render', renderSpy);

        app.view(root, (html) => html`<div></div>`);

        requestAnimationFrame(() => {
            expect(renderSpy.callCount).to.equal(1);

            app.commit('foo');
            requestAnimationFrame(() => {
                expect(renderSpy.callCount).to.equal(2);
                testDone();
            });
        });
    });

    it('should support multiple views', (testDone) => {
        const app = avalon();

        const root1 = document.createElement('div');
        app.view(root1, (html) => html`<div>foo</div>`);

        const root2 = document.createElement('div');
        app.view(root2, (html) => html`<div>bar</div>`);

        requestAnimationFrame(() => {
            expect(root1.innerHTML).to.equal('<div>foo</div>');
            expect(root2.innerHTML).to.equal('<div>bar</div>');
            testDone();
        });
    });

    it('should emit the render event for each view', (testDone) => {
        const app = avalon();

        const renderSpy = sinon.spy();
        app.on('render', renderSpy);

        const root1 = document.createElement('div');
        app.view(root1, (html) => html`<div>foo</div>`);

        const root2 = document.createElement('div');
        app.view(root2, (html) => html`<div>bar</div>`);

        requestAnimationFrame(() => {
            expect(renderSpy.callCount).to.equal(2);
            testDone();
        });
    });

    it('should support multiple renderings', (testDone) => {
        const app = avalon({count: 0});

        app.mutate('increment', ({count}) => ({count: count + 1}));

        const root = document.createElement('div');
        app.view(root, (html, {count}) => html`<div>${count}</div>`);

        app.commit('increment');
        app.commit('increment');
        app.commit('increment');
        app.commit('increment');

        requestAnimationFrame(() => {
            expect(root.innerHTML).to.equal('<div>4</div>');
            testDone();
        });
    });

    it('should support functional components', (testDone) => {
        const app = avalon();

        const Component = sinon.spy((html, {foo, bar, children}) => html`<div id=${foo} class=${bar}>${children}</div>`);

        const root = document.createElement('div');
        app.view(root, (html) => html`<${Component} foo="abc" bar="123">baz<//>`);

        requestAnimationFrame(() => {
            expect(root.innerHTML).to.equal('<div id="abc" class="123">baz</div>');
            expect(Component.callCount).to.equal(1);
            testDone();
        });
    });
});
