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

    it('should make the initial state object immutable', () => {
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

        const app = avalon(obj);
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

    it('should get the current URL path', () => {
        const app = avalon();
        expect(app.path()).to.equal(window.location.pathname);
    });

    it('should remove trailing slashes from the current URL path', () => {
        const app = avalon();

        history.replaceState(null, '', '/foo/');
        expect(app.path()).to.equal('/foo');
        history.replaceState(null, '', '/');
        expect(app.path()).to.equal('/');
    });
    
    it('should support custom events', () => {
        const app = avalon({foo: 1});

        const callback1 = sinon.spy();
        app.on('foo', callback1);

        const callback2 = sinon.spy();
        app.on('foo', callback2);
        
        app.emit('foo', 1, 2);
        expect(callback1.callCount).to.equal(1);
        expect(callback1.args[0][0]).to.equal(1);
        expect(callback1.args[0][1]).to.equal(2);
        expect(callback2.callCount).to.equal(1);
        expect(callback2.args[0][0]).to.equal(1);
        expect(callback2.args[0][1]).to.equal(2);

        app.emit('foo', 'bar', 'baz', 'qux');
        expect(callback1.callCount).to.equal(2);
        expect(callback1.args[1][0]).to.equal('bar');
        expect(callback1.args[1][1]).to.equal('baz');
        expect(callback1.args[1][2]).to.equal('qux');
        expect(callback2.callCount).to.equal(2);
        expect(callback2.args[1][0]).to.equal('bar');
        expect(callback2.args[1][1]).to.equal('baz');
        expect(callback2.args[1][2]).to.equal('qux');
    });

    it('should remove a custom event listener', () => {
        const app = avalon({foo: 1});
        
        const callback1 = sinon.spy();
        const off1 = app.on('foo', callback1);

        const callback2 = sinon.spy();
        const off2 = app.on('foo', callback2);

        app.emit('foo');
        expect(callback1.callCount).to.equal(1);
        expect(callback2.callCount).to.equal(1);

        off1();
        app.emit('foo');
        expect(callback1.callCount).to.equal(1);
        expect(callback2.callCount).to.equal(2);

        off2();
        app.emit('foo');
        expect(callback1.callCount).to.equal(1);
        expect(callback2.callCount).to.equal(2);
    });
});
