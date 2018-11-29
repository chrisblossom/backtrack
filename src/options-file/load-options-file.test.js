/* @flow */

import path from 'path';

require('./load-options-file');

const loadOptionsFile = (dir) =>
    require('./load-options-file').loadOptionsFile(dir);

describe('options', () => {
    const cwd = process.cwd();

    afterEach(() => {
        process.chdir(cwd);
    });

    test('handles module.exports', () => {
        const dir = path.resolve(__dirname, '__sandbox__/module-exports/');
        process.chdir(dir);

        const opts = loadOptionsFile();

        expect(opts).toMatchSnapshot();
    });

    test('handles module.exports - .backtrackrc.js', () => {
        const dir = path.resolve(__dirname, '__sandbox__/module-exports-rc/');
        process.chdir(dir);

        const opts = loadOptionsFile();

        expect(opts).toMatchSnapshot();
    });

    test('loads ES Modules config', () => {
        const dir = path.resolve(__dirname, '__sandbox__/es-modules/');
        process.chdir(dir);

        const opts = loadOptionsFile();

        expect(opts).toMatchSnapshot();
    });

    test('throws on missing config', () => {
        const dir = path.resolve(__dirname, '__sandbox__/missing/');
        process.chdir(dir);

        try {
            expect.hasAssertions();
            loadOptionsFile();
        } catch (error) {
            expect(error).toMatchSnapshot();
        }
    });

    test('throws if ES Modules without default', () => {
        const dir = path.resolve(
            __dirname,
            '__sandbox__/es-modules-no-default/',
        );
        process.chdir(dir);

        try {
            expect.hasAssertions();
            loadOptionsFile();
        } catch (error) {
            expect(error).toMatchSnapshot();
        }
    });

    test('handles custom searchPath', () => {
        const dir = path.resolve(__dirname, '__sandbox__/module-exports/');

        const opts = loadOptionsFile(dir);

        expect(opts).toMatchSnapshot();
    });
});
