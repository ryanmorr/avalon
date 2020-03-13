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

        const callback = sinon.spy(({state, action, route, params, commit}) => {
            expect(action).to.equal('foo');
            expect(route).to.equal(null);
            expect(state).to.equal(app.state());
            expect(params).to.deep.equal(null);
            expect(commit).to.be.a('function');
            commit('foo', 1);
            expect(mutatorSpy.callCount).to.equal(1);
            expect(app.state()).to.deep.equal({...initialState, foo: 1});
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

        const callback = sinon.spy(({state, action, route, params, commit}) => {
            expect(route).to.equal('/foo');
            expect(state).to.equal(app.state());
            expect(params).to.deep.equal(null);
            expect(action).to.equal(null);
            expect(commit).to.be.a('function');
            commit('foo', 1);
            expect(mutatorSpy.callCount).to.equal(1);
            expect(app.state()).to.deep.equal({...initialState, foo: 1});
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

        const listener = sinon.spy(({action, state, params}, returnValue) => {
            expect(action).to.equal('foo');
            expect(state).to.equal(app.state());
            expect(params).to.deep.equal({
                aaa: 'bar',
                bbb: 'baz',
                ccc: 'qux'
            });
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

        const listener = sinon.spy(({route, state, params}, returnValue) => {
            expect(route).to.equal('/foo/bar/baz/qux');
            expect(state).to.equal(app.state());
            expect(params).to.deep.equal({
                aaa: 'bar',
                bbb: 'baz',
                ccc: 'qux'
            });
            expect(returnValue).to.equal('foobar');
        });
        app.on('dispatch', listener);

        app.dispatch('/foo/bar/baz/qux');
        expect(listener.callCount).to.equal(1);
    });
});
