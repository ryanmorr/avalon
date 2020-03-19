import avalon from '../../src/avalon';

describe('dispatch', () => {
    let initialState = {title: 'Hello World'};

    afterEach(() => {
        document.title = 'Hello World';
        initialState = {title: 'Hello World'};
    });

    it('should dispatch an action', () => {
        const app = avalon(initialState);

        const mutatorSpy = sinon.spy((state, n) => ({foo: n}));
        app.mutate('foo', mutatorSpy);

        const dispatchSpy = sinon.spy(() => 123);
        app.action('bar', dispatchSpy);

        const emitSpy = sinon.spy();
        app.on('foo', emitSpy);

        const callback = sinon.spy(({state, action, route, params, event, commit, dispatch, emit}) => {
            expect(action).to.equal('foo');
            expect(state).to.equal(app.state());
            expect(params).to.deep.equal(null);
            expect(route).to.equal(null);
            expect(event).to.equal(null);
            expect(commit).to.be.a('function');
            commit('foo', 1);
            expect(mutatorSpy.callCount).to.equal(1);
            expect(app.state()).to.deep.equal({...initialState, foo: 1});
            expect(dispatch).to.be.a('function');
            expect(dispatch('bar')).to.equal(123);
            expect(dispatchSpy.callCount).to.equal(1);
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

        const mutatorSpy = sinon.spy((state, n) => ({foo: n}));
        app.mutate('foo', mutatorSpy);

        const dispatchSpy = sinon.spy(() => 123);
        app.action('bar', dispatchSpy);

        const emitSpy = sinon.spy();
        app.on('foo', emitSpy);

        const callback = sinon.spy(({state, action, route, params, event, commit, dispatch, emit}) => {
            expect(route).to.equal('/foo');
            expect(state).to.equal(app.state());
            expect(params).to.deep.equal(null);
            expect(action).to.equal(null);
            expect(event).to.equal(null);
            expect(commit).to.be.a('function');
            commit('foo', 1);
            expect(mutatorSpy.callCount).to.equal(1);
            expect(app.state()).to.deep.equal({...initialState, foo: 1});
            expect(dispatch).to.be.a('function');
            expect(dispatch('bar')).to.equal(123);
            expect(dispatchSpy.callCount).to.equal(1);
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
        const app = avalon();
        app.action('foo', () => 'foobar');

        const listener = sinon.spy(({action, state, params, event}, returnValue) => {
            expect(action).to.equal('foo');
            expect(state).to.equal(app.state());
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
        const app = avalon();
        app.route('/foo/:aaa/:bbb/:ccc', () => 'foobar');

        const listener = sinon.spy(({route, state, params, event}, returnValue) => {
            expect(route).to.equal('/foo/bar/baz/qux');
            expect(state).to.equal(app.state());
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

    it('should support asynchronous actions/routes via an optional second parameter and return a promise', (testDone) => {
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
        promise1.then((value) => {
            expect(value).to.equal('foo');
        });

        const promise2 = app.dispatch('/bar');

        expect(promise2).to.be.a('promise');
        promise2.catch((value) => {
            expect(value).to.equal('bar');
            testDone();
        });
    });

    it('should provide a promise for async actions/routes', (testDone) => {
        const app = avalon();

        app.action('foo', (data, done) => {
            setTimeout(() => done('foo'), 100);
        });

        app.on('dispatch', (data, promise) => {
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

        const callback = sinon.spy();
        app.action({
            foo: callback,
            bar: callback,
            baz: callback
        });

        app.dispatch('foo');
        expect(callback.callCount).to.equal(1);
        expect(callback.args[0][0].action).to.equal('foo');

        app.dispatch('bar');
        expect(callback.callCount).to.equal(2);
        expect(callback.args[1][0].action).to.equal('bar');

        app.dispatch('baz');
        expect(callback.callCount).to.equal(3);
        expect(callback.args[2][0].action).to.equal('baz');
    });

    it('should support adding multiple routes via an object literal', () => {
        const app = avalon();

        const callback = sinon.spy();
        app.route({
            '/foo': callback,
            '/bar': callback,
            '/baz': callback
        });

        app.dispatch('/foo');
        expect(callback.callCount).to.equal(1);
        expect(callback.args[0][0].route).to.equal('/foo');

        app.dispatch('/bar');
        expect(callback.callCount).to.equal(2);
        expect(callback.args[1][0].route).to.equal('/bar');

        app.dispatch('/baz');
        expect(callback.callCount).to.equal(3);
        expect(callback.args[2][0].route).to.equal('/baz');
    });
});
