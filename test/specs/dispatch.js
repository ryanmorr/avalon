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

        const callback = sinon.spy(({state, action, params, commit}) => {
            expect(action).to.equal('foo');
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

        const callback = sinon.spy(({params}) => {
            expect(params).to.deep.equal({a: 1, b: 2, c: 3});
        });
        app.action('foo', callback);

        app.dispatch('foo', {a: 1, b: 2, c: 3});
        expect(callback.called).to.equal(true);
    });
});
