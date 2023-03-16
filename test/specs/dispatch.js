import avalon from '../../src/avalon';

describe('dispatch', () => {
    let initialState = {title: 'Hello World'};

    afterEach(() => {
        document.title = 'Hello World';
        initialState = {title: 'Hello World'};
        history.replaceState(null, '', '/');
    });

    it('should dispatch an action', () => {
        const app = avalon(initialState);

        const mutationSpy = sinon.spy((state, n) => ({foo: n}));
        app.mutation('foo', mutationSpy);

        const dispatchSpy = sinon.spy(() => 123);
        app.action('bar', dispatchSpy);

        const route1Spy = sinon.spy(() => 321);
        app.route('/abc', route1Spy);

        const route2Spy = sinon.spy(() => 789);
        app.route('/xyz', route2Spy);

        const emitSpy = sinon.spy();
        app.on('foo', emitSpy);

        const callback = sinon.spy(({state, params, event, commit, dispatch, navigate, redirect, emit}) => {
            expect(state).to.equal(app.state());
            expect(params).to.equal(null);
            expect(event).to.equal(null);

            expect(commit).to.be.a('function');
            commit('foo', 1);
            expect(mutationSpy.callCount).to.equal(1);
            expect(app.state()).to.deep.equal({...initialState, foo: 1});

            expect(dispatch).to.be.a('function');
            expect(dispatch('bar')).to.equal(123);
            expect(dispatchSpy.callCount).to.equal(1);

            expect(navigate).to.be.a('function');
            expect(navigate('/abc')).to.equal(321);
            expect(route1Spy.callCount).to.equal(1);

            expect(redirect).to.be.a('function');
            expect(redirect('/xyz')).to.equal(789);
            expect(route2Spy.callCount).to.equal(1);

            expect(emit).to.be.a('function');
            emit('foo');
            expect(emitSpy.callCount).to.equal(1);

            return 'foobar';
        });

        app.action('foo', callback);

        const returnValue = app.dispatch('foo');
        expect(callback.callCount).to.equal(1);
        expect(returnValue).to.equal('foobar');
    });

    it('should dispatch an action with parameters', () => {
        const app = avalon();

        const callback = sinon.spy();
        app.action('foo', callback);

        app.dispatch('foo', {a: 1, b: 2, c: 3});
        expect(callback.callCount).to.equal(1);
        expect(callback.args[0][0].params).to.deep.equal({a: 1, b: 2, c: 3});
    });

    it('should dispatch a route', () => {
        const app = avalon(initialState);

        const mutationSpy = sinon.spy((state, n) => ({foo: n}));
        app.mutation('foo', mutationSpy);

        const dispatchSpy = sinon.spy(() => 123);
        app.action('bar', dispatchSpy);

        const route1Spy = sinon.spy(() => 321);
        app.route('/abc', route1Spy);

        const route2Spy = sinon.spy(() => 789);
        app.route('/xyz', route2Spy);

        const emitSpy = sinon.spy();
        app.on('foo', emitSpy);

        const callback = sinon.spy(({state, path, params, event, commit, dispatch, navigate, redirect, emit}) => {
            expect(state).to.equal(app.state());
            expect(path).to.equal('/foo');
            expect(params).to.equal(null);
            expect(event).to.equal(null);

            expect(commit).to.be.a('function');
            commit('foo', 1);
            expect(mutationSpy.callCount).to.equal(1);
            expect(app.state()).to.deep.equal({...initialState, foo: 1});

            expect(dispatch).to.be.a('function');
            expect(dispatch('bar')).to.equal(123);
            expect(dispatchSpy.callCount).to.equal(1);

            expect(navigate).to.be.a('function');
            expect(navigate('/abc')).to.equal(321);
            expect(route1Spy.callCount).to.equal(1);

            expect(redirect).to.be.a('function');
            expect(redirect('/xyz')).to.equal(789);
            expect(route2Spy.callCount).to.equal(1);

            expect(emit).to.be.a('function');
            emit('foo');
            expect(emitSpy.callCount).to.equal(1);

            return 'foobar';
        });

        app.route('/foo', callback);

        const returnValue = app.dispatch('/foo');
        expect(callback.callCount).to.equal(1);
        expect(returnValue).to.equal('foobar');
    });

    it('should dispatch a route using the current URL by default', () => {
        const app = avalon();

        const callback = sinon.spy();
        app.route('/', callback);

        app.dispatch();
        expect(callback.callCount).to.equal(1);
    });

    it('should dispatch a route with parameters', () => {
        const app = avalon();

        const callback = sinon.spy();
        app.route('/foo/:a/:b/:c', callback);

        app.dispatch('/foo/1/2/3');
        expect(callback.callCount).to.equal(1);
        expect(callback.args[0][0].params).to.deep.equal({a: 1, b: 2, c: 3});
    });

    it('should emit the dispatch event when an action is dispatched', () => {
        const app = avalon({foo: 1});
        app.mutation('foo', () => ({foo: 2}));
        app.action('foo', ({commit}) => commit('foo') && 'foobar');

        const listener = sinon.spy((type, name, state, params, event, returnValue) => {
            expect(type).to.equal('action');
            expect(name).to.equal('foo');
            expect(state).to.equal(app.state());
            expect(state).to.deep.equal({...initialState, foo: 2});
            expect(params).to.deep.equal({
                aaa: 'bar',
                bbb: 'baz',
                ccc: 'qux'
            });
            expect(event).to.equal(null);
            expect(returnValue).to.equal('foobar');
        });

        app.on('dispatch', listener);

        app.dispatch('foo', {
            aaa: 'bar',
            bbb: 'baz',
            ccc: 'qux'
        });
        expect(listener.callCount).to.equal(1);
    });

    it('should emit the dispatch event when a route is dispatched', () => {
        const app = avalon({foo: 1});
        app.mutation('foo', () => ({foo: 2}));
        app.route('/foo/:aaa/:bbb/:ccc', ({commit}) => commit('foo') && 'foobar');

        const listener = sinon.spy((type, path, state, params, event, returnValue) => {
            expect(type).to.equal('route');
            expect(path).to.equal('/foo/bar/baz/qux');
            expect(state).to.equal(app.state());
            expect(state).to.deep.equal({...initialState, foo: 2});
            expect(params).to.deep.equal({
                aaa: 'bar',
                bbb: 'baz',
                ccc: 'qux'
            });
            expect(event).to.equal(null);
            expect(returnValue).to.equal('foobar');
        });

        app.on('dispatch', listener);

        app.dispatch('/foo/bar/baz/qux');
        expect(listener.callCount).to.equal(1);
    });

    it('should support async actions/routes', async () => {
        const app = avalon(initialState);

        app.action('foo', (data, done) => {
            expect(done).to.be.a('function');
            setTimeout(() => done('foo'), 200);
        });

        app.route('/bar', (data, done, fail) => {
            expect(fail).to.be.a('function');
            setTimeout(() => fail('bar'), 500);
        });

        const promise1 = app.dispatch('foo');
        
        expect(promise1).to.be.a('promise');

        const value = await promise1;

        expect(value).to.equal('foo');

        try {
            const promise2 = app.dispatch('/bar');

            expect(promise2).to.be.a('promise');
        } catch(e) {
            expect(e).to.equal('bar');
        }
    });

    it('should provide a promise for async actions/routes', (testDone) => {
        const app = avalon();

        app.action('foo', (data, done) => {
            setTimeout(() => done('foo'), 100);
        });

        app.on('dispatch', (type, name, state, params, event, promise) => {
            expect(promise).to.be.a('promise');
            promise.then((value) => {
                expect(value).to.equal('foo');
                testDone();
            });
        });

        app.dispatch('foo', 1, 2, 3);
    });

    it('should support adding multiple actions via an object literal', () => {
        const app = avalon();

        const fooCallback = sinon.spy();
        const barCallback = sinon.spy();
        const bazCallback = sinon.spy();

        app.action({
            foo: fooCallback,
            bar: barCallback,
            baz: bazCallback
        });

        app.dispatch('foo');
        expect(fooCallback.callCount).to.equal(1);

        app.dispatch('bar');
        expect(barCallback.callCount).to.equal(1);

        app.dispatch('baz');
        expect(bazCallback.callCount).to.equal(1);
    });

    it('should support adding multiple routes via an object literal', () => {
        const app = avalon();

        const fooCallback = sinon.spy();
        const barCallback = sinon.spy();
        const bazCallback = sinon.spy();

        app.route({
            '/foo': fooCallback,
            '/bar': barCallback,
            '/baz': bazCallback
        });

        app.dispatch('/foo');
        expect(fooCallback.callCount).to.equal(1);

        app.dispatch('/bar');
        expect(barCallback.callCount).to.equal(1);

        app.dispatch('/baz');
        expect(bazCallback.callCount).to.equal(1);
    });
});
