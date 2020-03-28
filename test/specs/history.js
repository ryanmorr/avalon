import avalon from '../../src/avalon';

describe('history', () => {
    beforeEach(() => {
        history.replaceState(null, '', '/');
    });

    it('should navigate to a URL path, push to the session history stack, and dispatch the corresponding route', () => {
        const app = avalon();

        const pushStateSpy = sinon.spy(history, 'pushState');

        const callback = sinon.spy(() => {
            expect(app.path()).to.equal('/foo');
            return 'foo';
        });
        app.route('/foo', callback);

        const historyLength = history.length;

        const value = app.navigate('/foo');

        expect(value).to.equal('foo');
        expect(app.path()).to.equal('/foo');
        expect(callback.callCount).to.equal(1);
        expect(pushStateSpy.callCount).to.equal(1);
        expect(pushStateSpy.calledBefore(callback)).to.equal(true);
        expect(history.length).to.equal(historyLength + 1);
        pushStateSpy.restore();
    });

    it('should return a promise for async routes that is resolved when the route has finished executing after navigation', (testDone) => {
        const app = avalon();

        app.route('/foo', (data, done) => {
            setTimeout(() => done('foo'), 100);
        });

        app.navigate('/foo').then((value) => {
            expect(value).to.equal('foo');
            expect(app.path()).to.equal('/foo');
            testDone();
        });
    });

    it('should emit the pathchange event when moving backwards through the history stack', (testDone) => {
        history.replaceState(null, '', '/foo');
        history.pushState(null, '', '/bar');

        const app = avalon();
        app.route('/foo', () => {});

        const callback = sinon.spy();
        app.on('pathchange', callback);

        const onPopState = (e) => {
            e.preventDefault();
            expect(app.path()).to.equal('/foo');
            expect(callback.callCount).to.equal(1);
            expect(callback.args[0][0]).to.equal(app.path());

            window.removeEventListener('popstate', onPopState);
            testDone();
        };
        window.addEventListener('popstate', onPopState);

        history.back();
    });

    it('should emit the pathchange event when moving forwards through the history stack', (testDone) => {
        const app = avalon();
        app.route('/foo', () => {});

        const callback = sinon.spy();
        app.on('pathchange', callback);

        const onPopState = (e) => {
            e.preventDefault();
            if (callback.callCount === 1) {
                expect(app.path()).to.equal('/');
                expect(callback.args[0][0]).to.equal(app.path());

                history.forward();
            } else {
                expect(app.path()).to.equal('/foo');
                expect(callback.callCount).to.equal(2);
                expect(callback.args[1][0]).to.equal(app.path());

                window.removeEventListener('popstate', onPopState);
                testDone();
            }
        };
        window.addEventListener('popstate', onPopState);

        history.pushState(null, '', '/foo');
        history.back();
    });

    it('should not navigate if no corresponding route was found', () => {
        const app = avalon();

        const historyLength = history.length;

        const historyChangeSpy = sinon.spy();
        app.on('pathchange', historyChangeSpy);

        app.navigate('/foo');

        expect(app.path()).to.equal('/');
        expect(historyChangeSpy.callCount).to.equal(0);
        expect(historyLength).to.equal(history.length);
    });

    it('should not navigate if the provided URL path is equal to the current URL path', () => {
        const app = avalon();

        const pushStateSpy = sinon.spy(history, 'pushState');

        const callbackSpy = sinon.spy();
        app.route('/foo', callbackSpy);

        const historyChangeSpy = sinon.spy();
        app.on('pathchange', historyChangeSpy);

        app.navigate('/foo');

        expect(callbackSpy.callCount).to.equal(1);
        expect(pushStateSpy.callCount).to.equal(1);
        expect(historyChangeSpy.callCount).to.equal(1);
        const historyLength = history.length;

        app.navigate('/foo');

        expect(callbackSpy.callCount).to.equal(1);
        expect(pushStateSpy.callCount).to.equal(1);
        expect(historyChangeSpy.callCount).to.equal(1);
        expect(historyLength).to.equal(history.length);

        pushStateSpy.restore();
    });

    it('should redirect to a URL path, replace the current entry in the session history stack, and dispatch the corresponding route', () => {
        const app = avalon();

        const historyLength = history.length;

        const replaceStateSpy = sinon.spy(history, 'replaceState');

        const callbackSpy = sinon.spy(() => 'foo');
        app.route('/foo', callbackSpy);

        const value = app.redirect('/foo');

        expect(value).to.equal('foo');
        expect(app.path()).to.equal('/foo');
        expect(replaceStateSpy.callCount).to.equal(1);
        expect(callbackSpy.callCount).to.equal(1);
        expect(replaceStateSpy.calledBefore(callbackSpy)).to.equal(true);
        expect(historyLength).to.equal(history.length);
        replaceStateSpy.restore();
    });

    it('should return a promise for async routes that is resolved when the route has finished executing after redirection', (testDone) => {
        const app = avalon();

        app.route('/foo', (data, done) => {
            setTimeout(() => done('foo'), 100);
        });

        const promise = app.redirect('/foo');
        
        expect(promise).to.be.a('promise');
        promise.then((value) => {
            expect(value).to.equal('foo');
            expect(app.path()).to.equal('/foo');
            testDone();
        });
    });

    it('should emit the pathchange event on redirection', () => {
        const app = avalon();
        app.route('/foo', () => {});

        const callback = sinon.spy();
        app.on('pathchange', callback);

        app.redirect('/foo');

        expect(callback.callCount).to.equal(1);
        expect(callback.args[0][0]).to.equal(app.path());
    });

    it('should not redirect if no corresponding route was found', () => {
        const app = avalon();

        const historyLength = history.length;

        const historyChangeSpy = sinon.spy();
        app.on('pathchange', historyChangeSpy);

        app.redirect('/foo');

        expect(app.path()).to.equal('/');
        expect(historyChangeSpy.callCount).to.equal(0);
        expect(historyLength).to.equal(history.length);
    });

    it('should not redirect if the provided URL path is equal to the current URL path', () => {
        const app = avalon();

        const historyLength = history.length;

        const replaceStateSpy = sinon.spy(history, 'replaceState');

        const callbackSpy = sinon.spy(({state}) => (state));
        app.route('/foo', callbackSpy);

        const historyChangeSpy = sinon.spy();
        app.on('pathchange', historyChangeSpy);

        app.redirect('/foo');

        expect(callbackSpy.callCount).to.equal(1);
        expect(replaceStateSpy.callCount).to.equal(1);
        expect(historyChangeSpy.callCount).to.equal(1);
        expect(historyLength).to.equal(history.length);

        app.redirect('/foo');

        expect(callbackSpy.callCount).to.equal(1);
        expect(replaceStateSpy.callCount).to.equal(1);
        expect(historyChangeSpy.callCount).to.equal(1);
        expect(historyLength).to.equal(history.length);

        replaceStateSpy.restore();
    });

    it('should emit the pathchange event on navigation', () => {
        const app = avalon();

        app.route('/foo', () => {});

        const callback = sinon.spy();
        app.on('pathchange', callback);

        app.navigate('/foo');

        expect(callback.callCount).to.equal(1);
        expect(callback.args[0][0]).to.equal(app.path());
    });
});
