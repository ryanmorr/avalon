import avalon from '../../src/avalon';

describe('mutate', () => {
    let initialState = {title: 'Hello World'};

    afterEach(() => {
        document.title = 'Hello World';
        initialState = {title: 'Hello World'};
    });

    it('should mutate the state', () => {
        const app = avalon(initialState);

        const callback = sinon.spy(() => ({foo: 1}));
        app.mutate('foo', callback);

        const state = app.state();
        const partialState = app.commit('foo');

        expect(callback.callCount).to.equal(1);
        expect(callback.args[0][0]).to.equal(state);
        expect(callback.args[0][1]).to.equal(null);
        expect(partialState).to.deep.equal({foo: 1});
        expect(app.state()).to.deep.equal({...initialState, foo: 1});
    });

    it('should mutate the state with parameters', () => {
        const app = avalon(initialState);

        const callback = sinon.spy((state, data) => ({foo: data}));
        app.mutate('foo', callback);

        const state1 = app.state();
        const partialState1 = app.commit('foo', 2);

        expect(callback.callCount).to.equal(1);
        expect(callback.args[0][0]).to.equal(state1);
        expect(callback.args[0][1]).to.equal(2);
        expect(partialState1).to.deep.equal({foo: 2});
        expect(app.state()).to.deep.equal({...initialState, foo: 2});

        const state2 = app.state();
        const partialState2 = app.commit('foo', 5);

        expect(callback.callCount).to.equal(2);
        expect(callback.args[1][0]).to.equal(state2);
        expect(callback.args[1][1]).to.equal(5);
        expect(partialState2).to.deep.equal({foo: 5});
        expect(app.state()).to.deep.equal({...initialState, foo: 5});
    });

    it('should create a new state object after every mutation', () => {
        const obj = {};
        const app = avalon(obj);
        const state1 = app.state();
        app.mutate('foo', () => obj);
        app.mutate('bar', () => obj);

        app.commit('foo');
        const state2 = app.state();
        expect(state2).to.not.equal(state1);
        expect(state2).to.deep.equal(state1);

        app.commit('bar');
        const state3 = app.state();
        expect(state3).to.not.equal(state1);
        expect(state3).to.deep.equal(state1);
        expect(state3).to.not.equal(state2);
        expect(state3).to.deep.equal(state2);
    });

    it('should perform a shallow copy of the state returned by a mutator with the current state', () => {
        const app = avalon({...initialState, foo: 1, bar: 2, baz: 3});
        app.mutate('foo', () => ({qux: 4}));

        app.commit('foo');
        expect(app.state()).to.deep.equal({...initialState, foo: 1, bar: 2, baz: 3, qux: 4});
    });

    it('should copy object references and not clone the object', () => {
        const state = {...initialState, array: [1, 2, 3]};
        const app = avalon(state);

        app.mutate('foo', ({state}) => ({...state}));
        app.mutate('bar', ({state}) => (state));
        app.mutate('baz', () => ({array: [3, 2, 1]}));

        expect(app.state()).to.not.equal(state);
        expect(app.state().array).to.equal(state.array);

        app.commit('foo');
        expect(app.state().array).to.equal(state.array);

        app.commit('bar');
        expect(app.state().array).to.equal(state.array);

        app.commit('baz');
        expect(app.state().array).to.not.equal(state.array);
    });

    it('should make the new state object immutable after mutation', () => {
        const obj = {
            ...initialState,
            a: 1,
            b: ['foo', 'bar', 'baz'],
            c: true,
            d: false,
            e: {
                f: 10,
                g: [20, 30, {
                    h: 'foo',
                    i: 'bar'
                }]
            }
        };

        const app = avalon();
        app.mutate('foo', () => (obj));
        app.commit('foo');
        const state = app.state();

        expect(state).to.deep.equal(obj);
        expect(state).to.be.frozen;
        expect(state.b).to.be.frozen;
        expect(state.e).to.be.frozen;
        expect(state.e.g).to.be.frozen;
        expect(state.e.g[2]).to.be.frozen;

        try {
            state.a = 2;
            state.b.push('qux');
            state.c = false;
            state.d = true;
            state.e.f = 20;
            state.e.g.push(100);
            state.e.g[2].j = 'baz';
        } catch (e) {
            // empty
        } finally {
            expect(state).to.deep.equal({
                ...initialState,
                a: 1,
                b: ['foo', 'bar', 'baz'],
                c: true,
                d: false,
                e: {
                    f: 10,
                    g: [20, 30, {
                        h: 'foo',
                        i: 'bar'
                    }]
                }
            });
        }
    });

    it('should emit the mutate event when the state has changed', () => {
        const app = avalon({...initialState, foo: 1});
        const originalState = app.state();
        app.mutate('foo', () => ({bar: 2}));

        const callback = sinon.spy();
        app.on('mutate', callback);

        app.commit('foo');
        expect(callback.callCount).to.equal(1);

        const call = callback.getCall(0);
        const name = call.args[0];
        const prevState = call.args[1];
        const nextState = call.args[2];
        const partialState = call.args[3];

        expect(name).to.equal('foo');
        expect(prevState).to.equal(originalState);
        expect(prevState).to.deep.equal({...initialState, foo: 1});
        expect(prevState).to.not.equal(nextState);
        expect(prevState).to.not.deep.equal(nextState);
        expect(nextState).to.equal(app.state());
        expect(nextState).to.deep.equal({...initialState, foo: 1, bar: 2});
        expect(partialState).to.deep.equal({bar: 2});
    });

    it('should set the document title if the title property is changed', () => {
        const app = avalon(initialState);
        app.mutate('title', () => ({title: 'foo'}));

        app.commit('title');
        expect(app.state().title).to.equal('foo');
        expect(document.title).to.equal('foo');
    });
});
