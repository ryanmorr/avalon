import pkg from './package.json';
import babel from 'rollup-plugin-babel';
import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import minify from 'rollup-plugin-babel-minify';

const banner = `/*! ${pkg.name} v${pkg.version} | ${pkg.homepage} */`;

export default {
    input: 'src/avalon.js',
    output: [
        {
            banner,
            name: 'avalon',
            file: pkg.browser,
            format: 'umd',
            sourcemap: true
        },
        {
            banner,
            file: pkg.main,
            format: 'cjs',
            sourcemap: true
        },
        {
            banner,
            file: pkg.module,
            format: 'esm',
            sourcemap: true
        }
    ],
    plugins: [
        resolve(),
        babel({
            exclude: 'node_modules/**'
        }),
        commonjs(),
        minify()
    ]
};
