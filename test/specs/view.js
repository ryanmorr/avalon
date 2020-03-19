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

            const params = {
                foo: 1,
                bar: 2
            };
            const foo = dispatch('foo', params);
            expect(foo).to.be.a('function');
            foo();
            expect(fooSpy.called).to.equal(true);
            expect(fooSpy.args[0][0].params).to.equal(params);

            return html`<div></div>`;
        });

        const root = document.createElement('div');
        app.view(root, callback);

        requestAnimationFrame(() => {
            expect(callback.callCount).to.equal(1);
            testDone();
        });
    });

    it('should provide the event object if the dispatch function is used for an event listener', (testDone) => {
        const app = avalon();
        let eventObject, button;

        app.action('foo', ({params, event}) => {
            expect(params).to.deep.equal({bar: 'baz'});
            expect(event).to.equal(eventObject);
            testDone();
        });

        const root = document.createElement('div');
        app.view(root, (html, state, dispatch) => html`<button onclick=${dispatch('foo', {bar: 'baz'})}></button>`);

        requestAnimationFrame(() => {
            button = root.querySelector('button');
            eventObject = new Event('click');
            button.dispatchEvent(eventObject);
        });
    });
    
    it('should provide the same dispatch function if the name and params are equal to prevent patching event listeners on every render', (testDone) => {
        const app = avalon();

        app.action('foo', () => {});
        app.action('bar', () => {});

        const callback = sinon.spy((html, state, dispatch) => {
            const foo1 = dispatch('foo');
            const foo2 = dispatch('foo', {bar: 1});
            const foo3 = dispatch('foo', ['qux']);
            const foo4 = dispatch('foo', true);
            const bar1 = dispatch('bar');
            const bar2 = dispatch('bar', {bar: 1});
            const bar3 = dispatch('bar', ['qux']);
            const bar4 = dispatch('bar', true);

            expect(foo1).to.not.equal(foo2);
            expect(foo1).to.not.equal(foo3);
            expect(foo1).to.not.equal(foo4);
            expect(foo1).to.not.equal(bar1);
            expect(foo1).to.not.equal(bar2);
            expect(foo1).to.not.equal(bar3);
            expect(foo1).to.not.equal(bar4);
            expect(foo1).to.equal(dispatch('foo'));

            expect(foo2).to.not.equal(foo3);
            expect(foo2).to.not.equal(foo4);
            expect(foo2).to.not.equal(bar1);
            expect(foo2).to.not.equal(bar2);
            expect(foo2).to.not.equal(bar3);
            expect(foo2).to.not.equal(bar4);
            expect(foo2).to.equal(dispatch('foo', {bar: 1}));

            expect(foo3).to.not.equal(foo4);
            expect(foo3).to.not.equal(bar1);
            expect(foo3).to.not.equal(bar2);
            expect(foo3).to.not.equal(bar3);
            expect(foo3).to.not.equal(bar4);
            expect(foo3).to.equal(dispatch('foo', ['qux']));

            expect(foo4).to.not.equal(bar1);
            expect(foo4).to.not.equal(bar2);
            expect(foo4).to.not.equal(bar3);
            expect(foo4).to.not.equal(bar4);
            expect(foo4).to.equal(dispatch('foo', true));

            expect(bar1).to.not.equal(bar2);
            expect(bar1).to.not.equal(bar3);
            expect(bar1).to.not.equal(bar4);
            expect(bar1).to.equal(dispatch('bar'));

            expect(bar2).to.not.equal(bar3);
            expect(bar2).to.not.equal(bar4);
            expect(bar2).to.equal(dispatch('bar', {bar: 1}));

            expect(bar3).to.not.equal(bar4);
            expect(bar3).to.equal(dispatch('bar', ['qux']));

            expect(bar4).to.equal(dispatch('bar', true));

            return html`<div></div>`;
        });

        const root = document.createElement('div');
        app.view(root, callback);

        requestAnimationFrame(() => {
            expect(callback.called).to.equal(true);
            testDone();
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

    it('should support views with multiple root elements', (testDone) => {
        const app = avalon({foo: 1, bar: 2});

        const root = document.createElement('div');
        app.view(root, (html, {foo, bar}) => html`
            <div>${foo}</div>
            <span>${bar}</span>
        `);

        app.mutate('foobar', () => ({foo: 10, bar: 20}));

        requestAnimationFrame(() => {
            expect(root.innerHTML).to.equal('<div>1</div><span>2</span>');

            app.commit('foobar');
            requestAnimationFrame(() => {
                expect(root.innerHTML).to.equal('<div>10</div><span>20</span>');
                testDone();
            });
        });
    });
});
