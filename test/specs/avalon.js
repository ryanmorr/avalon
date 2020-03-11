import avalon from '../../src/avalon';

describe('avalon', () => {
    it('should create an initial state', () => {
        const obj = {foo: 1, bar: 2, baz: 3};
        const app = avalon(obj);

        const state = app.state();

        expect(state).to.be.a('object');
        expect(state).to.deep.equal(obj);
        expect(state).to.not.equal(obj);
        expect(Object.getPrototypeOf(state)).to.equal(null);
    });

    it('should create an empty object as the initial state by default', () => {
        const app = avalon();

        const state = app.state();
        expect(state).to.be.a('object');
        expect(state).to.deep.equal({});
    });
});
