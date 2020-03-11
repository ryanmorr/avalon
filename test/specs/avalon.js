import avalon from '../../src/avalon';

describe('avalon', () => {
    let initialState = {title: 'Hello World'};

    afterEach(() => {
        document.title = 'Hello World';
        initialState = {title: 'Hello World'};
    });

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
        expect(state).to.deep.equal({title: initialState.title});
    });

    it('should set the document title via the title property of the initial state', () => {
        avalon({title: 'foo'});
        expect(document.title).to.equal('foo');
    });

    it('should set the title property of state if not defined', () => {
        const title = 'foobar';
        document.title = title;

        expect(avalon().state().title).to.equal(title);
        expect(avalon({}).state().title).to.equal(title);
    });
});
