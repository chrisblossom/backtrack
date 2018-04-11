/* @flow */

import path from 'path';

const loadPackageJson = () => require('./load-package-json').loadPackageJson();

describe('loadPackageJson', () => {
    const cwd = process.cwd();

    afterEach(() => {
        process.chdir(cwd);
    });

    test('loads stat file', () => {
        const dir = path.resolve(__dirname, '__sandbox__/found-package-json/');
        process.chdir(dir);

        const result = loadPackageJson();

        expect(result).toMatchSnapshot();
    });

    test('fail when package json does not exist', () => {
        const dir = path.resolve(
            __dirname,
            '__sandbox__/missing-package-json/',
        );
        process.chdir(dir);

        try {
            expect.hasAssertions();
            loadPackageJson();
        } catch (error) {
            expect(error).toMatchSnapshot();
        }
    });
});
