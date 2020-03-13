import avalon from '../../src/avalon';

describe('router', () => {
    it('should route root paths', () => {
        const app = avalon();
        const callback = sinon.spy();
        app.route('/', callback);

        app.dispatch('/');
        expect(callback.callCount).to.equal(1);
        expect(callback.args[0][0].params).to.equal(null);

        app.dispatch('');
        expect(callback.callCount).to.equal(1);
    });

    it('should route single static paths', () => {
        const app = avalon();
        const callback = sinon.spy();
        app.route('/foo', callback);
        app.route('/bar/', callback);

        app.dispatch('/foo');
        expect(callback.callCount).to.equal(1);
        expect(callback.args[0][0].params).to.equal(null);

        app.dispatch('/foo/');
        expect(callback.callCount).to.equal(2);
        expect(callback.args[1][0].params).to.equal(null);

        app.dispatch('/bar');
        expect(callback.callCount).to.equal(3);
        expect(callback.args[2][0].params).to.equal(null);

        app.dispatch('/bar/');
        expect(callback.callCount).to.equal(4);
        expect(callback.args[3][0].params).to.equal(null);

        app.dispatch('');
        app.dispatch('/');
        app.dispatch('foo/');
        app.dispatch('foo');
        app.dispatch('/foo/bar');
        expect(callback.callCount).to.equal(4);
    });

    it('should route multiple static paths', () => {
        const app = avalon();
        const callback = sinon.spy();
        app.route('/foo/bar/baz', callback);

        app.dispatch('/foo/bar/baz');
        expect(callback.callCount).to.equal(1);
        expect(callback.args[0][0].params).to.equal(null);

        app.dispatch('/foo/bar/baz/');
        expect(callback.callCount).to.equal(2);
        expect(callback.args[1][0].params).to.equal(null);


        app.dispatch('foo/bar/baz');
        app.dispatch('/foo/bar/baz/qux');
        app.dispatch('/fo/bar/baz');
        expect(callback.callCount).to.equal(2);
    });

    it('should route paths with a single parameter', () => {
        const app = avalon();
        const callback = sinon.spy();

        app.route('/:foo', callback);

        app.dispatch('/aaa');
        expect(callback.callCount).to.equal(1);
        expect(callback.args[0][0].params).to.deep.equal({foo: 'aaa'});

        app.dispatch('/bbb/');
        expect(callback.callCount).to.equal(2);
        expect(callback.args[1][0].params).to.deep.equal({foo: 'bbb'});

        app.dispatch('');
        app.dispatch('root');
        app.dispatch('root/');
        expect(callback.callCount).to.equal(2);

        app.route('/root/:foo', callback);

        app.dispatch('/root/aaa');
        expect(callback.callCount).to.equal(3);
        expect(callback.args[2][0].params).to.deep.equal({foo: 'aaa'});

        app.dispatch('/root/bbb/');
        expect(callback.callCount).to.equal(4);
        expect(callback.args[3][0].params).to.deep.equal({foo: 'bbb'});

        app.dispatch('root/foo');
        app.dispatch('root/foo/');
        app.dispatch('/root/foo/bar');
        expect(callback.callCount).to.equal(4);
    });

    it('should route paths with multiple parameters', () => {
        const app = avalon();
        const callback = sinon.spy();

        app.route('/root/:foo/:bar', callback);

        app.dispatch('/root/foo/bar');
        expect(callback.callCount).to.equal(1);
        expect(callback.args[0][0].params).to.deep.equal({foo: 'foo', bar: 'bar'});

        app.dispatch('/root/aaa/bbb/');
        expect(callback.callCount).to.equal(2);
        expect(callback.args[1][0].params).to.deep.equal({foo: 'aaa', bar: 'bbb'});

        app.dispatch('root/foo/bar');
        app.dispatch('root/foo');
        app.dispatch('root/foo/');
        expect(callback.callCount).to.equal(2);

        app.route('/root/:foo/static/:bar', callback);

        app.dispatch('/root/foo/static/bar');
        expect(callback.callCount).to.equal(3);
        expect(callback.args[2][0].params).to.deep.equal({foo: 'foo', bar: 'bar'});

        app.dispatch('/root/aaa/static/bbb/');
        expect(callback.callCount).to.equal(4);
        expect(callback.args[3][0].params).to.deep.equal({foo: 'aaa', bar: 'bbb'});

        app.dispatch('root/foo/static/bar');
        app.dispatch('/root/foo/staic/bar');
        app.dispatch('/root/foo/static/bar/baz');
        expect(callback.callCount).to.equal(4);
    });

    it('should route paths with a single optional parameter', () => {
        const app = avalon();
        const callback = sinon.spy();

        app.route('/root/:foo?', callback);

        app.dispatch('/root');
        expect(callback.callCount).to.equal(1);
        expect(callback.args[0][0].params).to.deep.equal({foo: null});

        app.dispatch('/root/');
        expect(callback.callCount).to.equal(2);
        expect(callback.args[1][0].params).to.deep.equal({foo: null});

        app.dispatch('/root/foo');
        expect(callback.callCount).to.equal(3);
        expect(callback.args[2][0].params).to.deep.equal({foo: 'foo'});

        app.dispatch('/root/bar/');
        expect(callback.callCount).to.equal(4);
        expect(callback.args[3][0].params).to.deep.equal({foo: 'bar'});

        app.dispatch('root/foo/bar');
        app.dispatch('root/foo/bar/');
        app.dispatch('/root/foo/bar');
        expect(callback.callCount).to.equal(4);

        app.route('/:foo?', callback);

        app.dispatch('/');
        expect(callback.callCount).to.equal(5);
        expect(callback.args[4][0].params).to.deep.equal({foo: null});

        app.dispatch('/foo');
        expect(callback.callCount).to.equal(6);
        expect(callback.args[5][0].params).to.deep.equal({foo: 'foo'});

        app.dispatch('/bar/');
        expect(callback.callCount).to.equal(7);
        expect(callback.args[6][0].params).to.deep.equal({foo: 'bar'});

        app.dispatch('');
        expect(callback.callCount).to.equal(7);
    });

    it('should route paths with multiple optional parameters', () => {
        const app = avalon();
        const callback = sinon.spy();

        app.route('/root/:foo?/static/:bar?', callback);

        app.dispatch('/root/foo/static');
        expect(callback.callCount).to.equal(1);
        expect(callback.args[0][0].params).to.deep.equal({foo: 'foo', bar: null});

        app.dispatch('/root/bar/static/');
        expect(callback.callCount).to.equal(2);
        expect(callback.args[1][0].params).to.deep.equal({foo: 'bar', bar: null});

        app.dispatch('/root/foo/static/bar');
        expect(callback.callCount).to.equal(3);
        expect(callback.args[2][0].params).to.deep.equal({foo: 'foo', bar: 'bar'});

        app.dispatch('/root/aaa/static/bbb/');
        expect(callback.callCount).to.equal(4);
        expect(callback.args[3][0].params).to.deep.equal({foo: 'aaa', bar: 'bbb'});

        app.dispatch('root/foo/static');
        app.dispatch('root/foo/static/bar/');
        app.dispatch('/root/foo/static/bar/baz');
        app.dispatch('/root/foo/staic/bar');
        expect(callback.callCount).to.equal(4);

        app.route('/root/:foo?/:bar?', callback);

        app.dispatch('/root/foo');
        expect(callback.callCount).to.equal(5);
        expect(callback.args[4][0].params).to.deep.equal({foo: 'foo', bar: null});

        app.dispatch('/root/bar/');
        expect(callback.callCount).to.equal(6);
        expect(callback.args[5][0].params).to.deep.equal({foo: 'bar', bar: null});

        app.dispatch('/root/foo/bar');
        expect(callback.callCount).to.equal(7);
        expect(callback.args[6][0].params).to.deep.equal({foo: 'foo', bar: 'bar'});

        app.dispatch('/root/aaa/bbb/');
        expect(callback.callCount).to.equal(8);
        expect(callback.args[7][0].params).to.deep.equal({foo: 'aaa', bar: 'bbb'});

        app.dispatch('root/foo');
        app.dispatch('root/foo/');
        app.dispatch('root/foo/bar');
        app.dispatch('root/foo/bar/');
        app.dispatch('/root/foo/bar/baz');
        expect(callback.callCount).to.equal(8);
    });

    it('should route wildcards', () => {
        const app = avalon();
        const callback = sinon.spy();

        app.route('/root/*', callback);

        app.dispatch('/root/foo');
        expect(callback.callCount).to.equal(1);
        expect(callback.args[0][0].params).to.deep.equal({wildcard: 'foo'});

        app.dispatch('/root/bar/');
        expect(callback.callCount).to.equal(2);
        expect(callback.args[1][0].params).to.deep.equal({wildcard: 'bar'});

        app.dispatch('/root/foo/bar');
        expect(callback.callCount).to.equal(3);
        expect(callback.args[2][0].params).to.deep.equal({wildcard: 'foo/bar'});

        app.dispatch('/root');
        app.dispatch('/root/');
        app.dispatch('root/foo');
        app.dispatch('root/foo/');
        expect(callback.callCount).to.equal(3);

        app.route('/*', callback);

        app.dispatch('/');
        expect(callback.callCount).to.equal(4);
        expect(callback.args[3][0].params).to.deep.equal({wildcard: ''});

        app.dispatch('/foo');
        expect(callback.callCount).to.equal(5);
        expect(callback.args[4][0].params).to.deep.equal({wildcard: 'foo'});

        app.dispatch('/bar/');
        expect(callback.callCount).to.equal(6);
        expect(callback.args[5][0].params).to.deep.equal({wildcard: 'bar'});

        app.dispatch('/foo/bar');
        expect(callback.callCount).to.equal(7);
        expect(callback.args[6][0].params).to.deep.equal({wildcard: 'foo/bar'});

        app.dispatch('');
        expect(callback.callCount).to.equal(7);
    });

    it('should route paths with parameters and optional parameters', () => {
        const app = avalon();
        const callback = sinon.spy();

        app.route('/root/:foo/:bar?/:baz?', callback);

        app.dispatch('/root/foo');
        expect(callback.callCount).to.equal(1);
        expect(callback.args[0][0].params).to.deep.equal({foo: 'foo', bar: null, baz: null});

        app.dispatch('/root/bar/');
        expect(callback.callCount).to.equal(2);
        expect(callback.args[1][0].params).to.deep.equal({foo: 'bar', bar: null, baz: null});

        app.dispatch('/root/foo/bar');
        expect(callback.callCount).to.equal(3);
        expect(callback.args[2][0].params).to.deep.equal({foo: 'foo', bar: 'bar', baz: null});

        app.dispatch('/root/aaa/bbb/');
        expect(callback.callCount).to.equal(4);
        expect(callback.args[3][0].params).to.deep.equal({foo: 'aaa', bar: 'bbb', baz: null});

        app.dispatch('/root/foo/bar/baz');
        expect(callback.callCount).to.equal(5);
        expect(callback.args[4][0].params).to.deep.equal({foo: 'foo', bar: 'bar', baz: 'baz'});

        app.dispatch('/root/aaa/bbb/ccc/');
        expect(callback.callCount).to.equal(6);
        expect(callback.args[5][0].params).to.deep.equal({foo: 'aaa', bar: 'bbb', baz: 'ccc'});

        app.dispatch('/root');
        app.dispatch('/root/');
        app.dispatch('root/foo');
        expect(callback.callCount).to.equal(6);
    });

    it('should route special characters as defined by RFC 3986', () => {
        const app = avalon();
        const callback = sinon.spy();
        app.route('/foo/:bar', callback);

        app.dispatch('/foo/-._~:?#[]@!$&\'()*+,;=');
        expect(callback.callCount).to.equal(1);
        expect(callback.args[0][0].params.bar).to.equal('-._~:?#[]@!$&\'()*+,;=');
    });

    it('should decode URL-encoded parameters', () => {
        const app = avalon();
        const callback = sinon.spy();
        app.route('/foo/:bar', callback);

        app.dispatch('/foo/%D1%88%D0%B5%D0%BB%D0%BB%D1%8B');
        expect(callback.callCount).to.equal(1);
        expect(callback.args[0][0].params.bar).to.equal('шеллы');
    });

    it('should convert string versions of a primitive value to its natural type', () => {
        const app = avalon();
        const callback = sinon.spy();
        app.route('/:string/:true/:false/:int/:float', callback);

        app.dispatch('/foo/true/false/123/45.891');
        expect(callback.callCount).to.equal(1);

        const params = callback.args[0][0].params;
        expect(params.string).to.equal('foo');
        expect(params.true).to.equal(true);
        expect(params.false).to.equal(false);
        expect(params.int).to.equal(123);
        expect(params.float).to.equal(45.891);
    });

    it('should support a catch-all route', () => {
        const app = avalon();

        app.route('/foo', () => {});
        app.route('/bar', () => {});

        const callback = sinon.spy();
        app.route('/*', callback);

        app.dispatch('/foo');
        expect(callback.called).to.equal(false);

        app.dispatch('/bar');
        expect(callback.called).to.equal(false);

        app.dispatch('/baz');
        expect(callback.callCount).to.equal(1);
    });
});
