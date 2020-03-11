import avalon from '../../src/avalon';

describe('mutate', () => {
    let initialState = {title: 'Hello World'};

    afterEach(() => {
        document.title = 'Hello World';
        initialState = {title: 'Hello World'};
    });

    it('should mutate the state', () => {
        const app = avalon(initialState);
        const initialAppState = app.state();

        const callback = sinon.spy(() => ({foo: 1}));
        app.mutate('foo', callback);

        const partialState = app.commit('foo');

        expect(callback.callCount).to.equal(1);
        expect(callback.args[0][0]).to.equal(initialAppState);
        expect(callback.args[0][1]).to.equal(null);
        expect(partialState).to.deep.equal({foo: 1});
        expect(app.state()).to.deep.equal({...initialState, foo: 1});
    });

    it('should mutate the state with parameters', () => {
        const app = avalon(initialState);
        const initialAppState = app.state();

        const callback = sinon.spy((state, data) => ({foo: data}));
        app.mutate('foo', callback);

        const partialState = app.commit('foo', 2);

        expect(callback.callCount).to.equal(1);
        expect(callback.args[0][0]).to.equal(initialAppState);
        expect(callback.args[0][1]).to.equal(2);
        expect(partialState).to.deep.equal({foo: 2});
        expect(app.state()).to.deep.equal({...initialState, foo: 2});
    });
});
