import avalon from '../../src/avalon';

describe('evented', () => {
    afterEach(() => {
        history.replaceState(null, '', '/');
    });

    function once(el, type, fn, capture = false) {
        const callback = (e) => {
            e.preventDefault();
            fn(e);
            el.removeEventListener(type, callback, capture);
        };
        el.addEventListener(type, callback, capture);
    }

    it('should automatically dispatch action on click of a link', (testDone) => {
        const clickEvent = new MouseEvent('click', {
            bubbles: true,
            cancelable: true,
            button: 0
        });

        const anchor = document.createElement('a');
        anchor.href = 'foo';
        document.body.appendChild(anchor);

        const app = avalon();
        const path = app.path();
        const callback = sinon.spy();
        app.action('foo', callback);

        app.on('dispatch', () => {
            expect(callback.callCount).to.equal(1);
            expect(callback.args[0][0].event).to.equal(clickEvent);
            expect(app.path()).to.equal(path);
            anchor.remove();
            testDone();
        });

        anchor.dispatchEvent(clickEvent);
    });

    it('should automatically dispatch action on form submit', (testDone) => {
        const submitEvent = new Event('submit', {
            bubbles: true,
            cancelable: true
        });

        const form = document.createElement('form');
        form.action = 'foo';
        document.body.appendChild(form);

        const app = avalon();
        const path = app.path();
        const callback = sinon.spy();
        app.action('foo', callback);

        app.on('dispatch', () => {
            expect(callback.callCount).to.equal(1);
            expect(callback.args[0][0].event).to.equal(submitEvent);
            expect(app.path()).to.equal(path);
            form.remove();
            testDone();
        });

        form.dispatchEvent(submitEvent);
    });

    it('should automatically dispatch route on click of a link', (testDone) => {
        const clickEvent = new MouseEvent('click', {
            bubbles: true,
            cancelable: true,
            button: 0
        });

        const anchor = document.createElement('a');
        anchor.href = '/foo';
        document.body.appendChild(anchor);

        const app = avalon();
        const callback = sinon.spy();
        app.route('/foo', callback);

        app.on('dispatch', () => {
            expect(callback.callCount).to.equal(1);
            expect(callback.args[0][0].event).to.equal(clickEvent);
            expect(app.path()).to.equal('/foo');
            anchor.remove();
            testDone();
        });

        anchor.dispatchEvent(clickEvent);
    });

    it('should automatically dispatch route on form submit', (testDone) => {
        const submitEvent = new Event('submit', {
            bubbles: true,
            cancelable: true
        });

        const form = document.createElement('form');
        form.action = '/foo';
        document.body.appendChild(form);

        const app = avalon();
        const callback = sinon.spy();
        app.route('/foo', callback);

        app.on('dispatch', () => {
            expect(callback.callCount).to.equal(1);
            expect(callback.args[0][0].event).to.equal(submitEvent);
            expect(app.path()).to.equal('/foo');
            form.remove();
            testDone();
        });

        form.dispatchEvent(submitEvent);
    });

    it('should automatically dispatch a route on click to nested elements within a link', (testDone) => {
        const anchor = document.createElement('a');
        anchor.href = '/foo';
        anchor.innerHTML = '<div><em><i>Click</i></em></div>';
        const i = anchor.querySelector('i');
        document.body.appendChild(anchor);

        const app = avalon();
        const callback = sinon.spy(({event}) => {
            expect(event).to.be.a('mouseevent');
        });
        app.route('/foo', callback);

        app.on('dispatch', () => {
            expect(callback.callCount).to.equal(1);
            anchor.remove();
            testDone();
        });

        i.dispatchEvent(new MouseEvent('click', {
            bubbles: true,
            cancelable: true,
            button: 0
        }));
    });

    it('should ignore click not generated from a link', (testDone) => {
        const div = document.createElement('div');
        div.href = '/foo';
        document.body.appendChild(div);

        const app = avalon();
        const callback = sinon.spy();
        app.route('/foo', callback);

        once(document, 'click', () => {
            expect(callback.called).to.equal(false);
            div.remove();
            testDone();
        });

        div.dispatchEvent(new MouseEvent('click', {
            bubbles: true,
            cancelable: true,
            button: 0
        }));
    });

    it('should ignore link clicked if the default action is prevented', (testDone) => {
        const anchor = document.createElement('a');
        anchor.href = '/foo';
        document.body.appendChild(anchor);

        const app = avalon();
        const callback = sinon.spy();
        app.route('/foo', callback);

        const onClick = sinon.spy((e) => e.preventDefault());
        once(anchor, 'click', onClick, true);

        once(document, 'click', (e) => {
            expect(e.defaultPrevented).to.equal(true);
            expect(callback.called).to.equal(false);
            expect(onClick.called).to.equal(true);
            anchor.remove();
            testDone();
        });

        anchor.dispatchEvent(new MouseEvent('click', {
            bubbles: true,
            cancelable: true,
            ctrlKey: true,
            button: 0
        }));
    });

    it('should ignore link clicked with the control key pressed', (testDone) => {
        const anchor = document.createElement('a');
        anchor.href = '/foo';
        document.body.appendChild(anchor);

        const app = avalon();
        const callback = sinon.spy();
        app.route('/foo', callback);

        once(document, 'click', () => {
            expect(callback.called).to.equal(false);
            anchor.remove();
            testDone();
        });

        anchor.dispatchEvent(new MouseEvent('click', {
            bubbles: true,
            cancelable: true,
            ctrlKey: true,
            button: 0
        }));
    });

    it('should ignore link clicked with the meta key pressed', (testDone) => {
        const anchor = document.createElement('a');
        anchor.href = '/foo';
        document.body.appendChild(anchor);

        const app = avalon();
        const callback = sinon.spy();
        app.route('/foo', callback);

        once(document, 'click', () => {
            expect(callback.called).to.equal(false);
            anchor.remove();
            testDone();
        });

        anchor.dispatchEvent(new MouseEvent('click', {
            bubbles: true,
            cancelable: true,
            metaKey: true,
            button: 0
        }));
    });

    it('should ignore link clicked with the alt key pressed', (testDone) => {
        const anchor = document.createElement('a');
        anchor.href = '/foo';
        document.body.appendChild(anchor);

        const app = avalon();
        const callback = sinon.spy();
        app.route('/foo', callback);

        once(document, 'click', () => {
            expect(callback.called).to.equal(false);
            anchor.remove();
            testDone();
        });

        anchor.dispatchEvent(new MouseEvent('click', {
            bubbles: true,
            cancelable: true,
            altKey: true,
            button: 0
        }));
    });

    it('should ignore link clicked with the shift key pressed', (testDone) => {
        const anchor = document.createElement('a');
        anchor.href = '/foo';
        document.body.appendChild(anchor);

        const app = avalon();
        const callback = sinon.spy();
        app.route('/foo', callback);

        once(document, 'click', () => {
            expect(callback.called).to.equal(false);
            anchor.remove();
            testDone();
        });

        anchor.dispatchEvent(new MouseEvent('click', {
            bubbles: true,
            cancelable: true,
            shiftKey: true,
            button: 0
        }));
    });

    it('should ignore link clicked with the middle mouse button', (testDone) => {
        const anchor = document.createElement('a');
        anchor.href = '/foo';
        document.body.appendChild(anchor);

        const app = avalon();
        const callback = sinon.spy();
        app.route('/foo', callback);

        once(document, 'click', () => {
            expect(callback.called).to.equal(false);
            anchor.remove();
            testDone();
        });

        anchor.dispatchEvent(new MouseEvent('click', {
            bubbles: true,
            cancelable: true,
            button: 1
        }));
    });

    it('should ignore link clicked with the right mouse button', (testDone) => {
        const anchor = document.createElement('a');
        anchor.href = '/foo';
        document.body.appendChild(anchor);

        const app = avalon();
        const callback = sinon.spy();
        app.route('/foo', callback);

        once(document, 'click', () => {
            expect(callback.called).to.equal(false);
            anchor.remove();
            testDone();
        });

        anchor.dispatchEvent(new MouseEvent('click', {
            bubbles: true,
            cancelable: true,
            button: 2
        }));
    });

    it('should ignore link without a href attribute', (testDone) => {
        const anchor = document.createElement('a');
        anchor.href = '';
        document.body.appendChild(anchor);

        const app = avalon();
        const callback = sinon.spy();
        app.route('/foo', callback);

        once(document, 'click', () => {
            expect(callback.called).to.equal(false);
            anchor.remove();
            testDone();
        });

        anchor.dispatchEvent(new MouseEvent('click', {
            bubbles: true,
            cancelable: true,
            button: 0
        }));
    });

    it('should ignore link with a download attribute', (testDone) => {
        const anchor = document.createElement('a');
        anchor.href = '/foo';
        anchor.setAttribute('download', '');
        document.body.appendChild(anchor);

        const app = avalon();
        const callback = sinon.spy();
        app.route('/foo', callback);

        once(document, 'click', () => {
            expect(callback.called).to.equal(false);
            anchor.remove();
            testDone();
        });

        anchor.dispatchEvent(new MouseEvent('click', {
            bubbles: true,
            cancelable: true,
            button: 0
        }));
    });

    it('should ignore link with a rel=external attribute', (testDone) => {
        const anchor = document.createElement('a');
        anchor.href = '/foo';
        anchor.setAttribute('rel', 'external');
        document.body.appendChild(anchor);

        const app = avalon();
        const callback = sinon.spy();
        app.route('/foo', callback);

        once(document, 'click', () => {
            expect(callback.called).to.equal(false);
            anchor.remove();
            testDone();
        });

        anchor.dispatchEvent(new MouseEvent('click', {
            bubbles: true,
            cancelable: true,
            button: 0
        }));
    });

    it('should ignore link with a target=_blank attribute', (testDone) => {
        const anchor = document.createElement('a');
        anchor.href = '/foo';
        anchor.setAttribute('target', '_blank');
        document.body.appendChild(anchor);

        const app = avalon();
        const callback = sinon.spy();
        app.route('/foo', callback);

        once(document, 'click', () => {
            expect(callback.called).to.equal(false);
            anchor.remove();
            testDone();
        });

        anchor.dispatchEvent(new MouseEvent('click', {
            bubbles: true,
            cancelable: true,
            button: 0
        }));
    });

    it('should ignore form without an action attribute', (testDone) => {
        const form = document.createElement('form');
        document.body.appendChild(form);

        const app = avalon();
        const callback = sinon.spy();
        app.route('/foo', callback);

        once(document, 'submit', () => {
            expect(callback.called).to.equal(false);
            form.remove();
            testDone();
        });

        form.dispatchEvent(new Event('submit', {
            bubbles: true,
            cancelable: true
        }));
    });

    it('should ignore link with a different hostname than the window', (testDone) => {
        const anchor = document.createElement('a');
        anchor.href = 'http://google.com';
        document.body.appendChild(anchor);

        const app = avalon();
        const callback = sinon.spy();
        app.route('/foo', callback);

        once(document, 'click', () => {
            expect(callback.called).to.equal(false);
            anchor.remove();
            testDone();
        });

        anchor.dispatchEvent(new MouseEvent('click', {
            bubbles: true,
            cancelable: true,
            button: 0
        }));
    });

    it('should ignore link with a different scheme than the window', (testDone) => {
        const anchor = document.createElement('a');
        anchor.href = 'mailto:example@example.com';
        document.body.appendChild(anchor);

        const app = avalon();
        const callback = sinon.spy();
        app.route('/foo', callback);

        once(document, 'click', () => {
            expect(callback.called).to.equal(false);
            anchor.remove();
            testDone();
        });

        anchor.dispatchEvent(new MouseEvent('click', {
            bubbles: true,
            cancelable: true,
            button: 0
        }));
    });

    it('should ignore link that does not match an action/route', (testDone) => {
        const anchor = document.createElement('a');
        anchor.href = '/foo';
        document.body.appendChild(anchor);

        const app = avalon();
        const callback = sinon.spy();
        app.route('/bar', callback);

        once(document, 'click', () => {
            expect(callback.called).to.equal(false);
            anchor.remove();
            testDone();
        });

        anchor.dispatchEvent(new MouseEvent('click', {
            bubbles: true,
            cancelable: true,
            button: 0
        }));
    });

    it('should ignore link when the path matches the current URL path', (testDone) => {
        const anchor = document.createElement('a');
        anchor.href = '/foo';
        document.body.appendChild(anchor);

        const app = avalon();
        const spy = sinon.spy(history, 'pushState');
        const callback = sinon.spy();
        app.route('/foo', callback);

        once(document, 'click', () => {
            expect(spy.called).to.equal(false);
            expect(callback.called).to.equal(false);
            anchor.remove();
            spy.restore();
            testDone();
        });

        history.replaceState(null, '', '/foo');

        anchor.dispatchEvent(new MouseEvent('click', {
            bubbles: true,
            cancelable: true,
            button: 0
        }));
    });

    it('should remove trailing slashes from route on click/submit', (testDone) => {
        const anchor = document.createElement('a');
        anchor.href = '/foo/';
        document.body.appendChild(anchor);

        const app = avalon();
        const callback = sinon.spy();
        app.route('/foo', callback);

        app.on('dispatch', ({route}) => {
            expect(route).to.equal('/foo');
            expect(app.path()).to.equal('/foo');
            expect(callback.callCount).to.equal(1);
            anchor.remove();
            testDone();
        });

        anchor.dispatchEvent(new MouseEvent('click', {
            bubbles: true,
            cancelable: true,
            button: 0
        }));
    });

    it('should provide the event to the dispatch custom event on route click', (testDone) => {
        const clickEvent = new MouseEvent('click', {
            bubbles: true,
            cancelable: true,
            button: 0
        });

        const anchor = document.createElement('a');
        anchor.href = '/foo';
        document.body.appendChild(anchor);

        const app = avalon();
        app.route('/foo', () => {});
        app.on('dispatch', ({event}) => {
            expect(event).to.equal(clickEvent);
            anchor.remove();
            testDone();
        });

        anchor.dispatchEvent(clickEvent);
    });

    it('should provide the event to the dispatch custom event on route submit', (testDone) => {
        const submitEvent = new Event('submit', {
            bubbles: true,
            cancelable: true
        });

        const form = document.createElement('form');
        form.action = '/foo';
        document.body.appendChild(form);

        const app = avalon();
        app.route('/foo', () => {});
        app.on('dispatch', ({event}) => {
            expect(event).to.equal(submitEvent);
            form.remove();
            testDone();
        });

        form.dispatchEvent(submitEvent);
    });

    it('should emit the pathchange event on evented navigation', (testDone) => {
        const anchor = document.createElement('a');
        anchor.href = '/foo';
        document.body.appendChild(anchor);

        const app = avalon();
        const routeSpy = sinon.spy();
        app.route('/foo', routeSpy);
        const pathChangeSpy = sinon.spy();
        app.on('pathchange', pathChangeSpy);

        const dispatchSpy = sinon.spy(({route}) => {
            expect(pathChangeSpy.callCount).to.equal(1);
            expect(pathChangeSpy.args[0][0]).to.equal('navigate');
            expect(pathChangeSpy.args[0][1]).to.equal(app.path());
            expect(route).to.equal('/foo');

            anchor.remove();
            testDone();
        });
        app.on('dispatch', dispatchSpy);

        anchor.dispatchEvent(new MouseEvent('click', {
            bubbles: true,
            cancelable: true,
            button: 0
        }));
    });

    it('should support SVG anchors', (testDone) => {
        const clickEvent = new MouseEvent('click', {
            bubbles: true,
            cancelable: true,
            button: 0
        });

        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        const anchor = document.createElementNS('http://www.w3.org/2000/svg', 'a');
        anchor.setAttribute('href', '/foo');
        svg.appendChild(anchor);
        document.body.appendChild(svg);

        const app = avalon();
        const callback = sinon.spy();
        app.route('/foo', callback);

        app.on('dispatch', () => {
            expect(callback.callCount).to.equal(1);
            expect(callback.args[0][0].event).to.equal(clickEvent)
            expect(app.path()).to.equal('/foo');
            svg.remove();
            testDone();
        });

        anchor.dispatchEvent(clickEvent);
    });
});
