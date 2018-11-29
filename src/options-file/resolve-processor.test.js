/* @flow */

import path from 'path';

require('./resolve-processor');

const resolveProcessor = (args) =>
    // $FlowIgnore
    require('./resolve-processor').resolveProcessor(args);

describe('resolveProcessor', () => {
    const cwd = process.cwd();

    afterEach(() => {
        process.chdir(cwd);
    });

    test('resolves multiple presets', () => {
        const value = ['backtrack-preset-01', 'backtrack-preset-02'];
        const dirname = path.resolve(__dirname, '__sandbox__/app1/');
        process.chdir(dirname);

        const result = resolveProcessor({
            value,
            dirname,
        });

        expect(result).toMatchSnapshot();
    });

    test('allow for packageId', () => {
        const value = [{ id: 'renamed', packageId: 'backtrack-preset-01' }];
        const dirname = path.resolve(__dirname, '__sandbox__/app1/');
        process.chdir(dirname);

        const result = resolveProcessor({
            value,
            dirname,
        });

        expect(result).toMatchSnapshot();
    });

    test('allow for packagePath', () => {
        const value = [
            {
                id: 'preset-01',
                packagePath: path.normalize('./preset-01.js'),
            },
        ];

        const dirname = path.resolve(__dirname, '__sandbox__/');
        process.chdir(dirname);

        const result = resolveProcessor({
            value,
            dirname,
        });

        expect(result).toMatchSnapshot();
    });

    test('allows single', () => {
        const value = 'backtrack-preset-01';
        const dirname = path.resolve(__dirname, '__sandbox__/app1/');
        process.chdir(dirname);

        const result = resolveProcessor({
            value,
            dirname,
        });

        expect(result).toMatchSnapshot();
    });

    test('adds to current', () => {
        const value = ['backtrack-preset-01'];
        const dirname = path.resolve(__dirname, '__sandbox__/app1/');
        process.chdir(dirname);

        const current = {
            eslint: path.normalize('/path/to/eslint'),
        };

        const result = resolveProcessor({
            value,
            current,
            dirname,
        });

        expect(result).toMatchSnapshot();
    });

    test('overwrites key', () => {
        const value = ['backtrack-preset-01'];
        const dirname = path.resolve(__dirname, '__sandbox__/app1/');
        process.chdir(dirname);

        const current = {
            'backtrack-preset-01': path.normalize(
                '/path/to/backtrack-preset-01',
            ),
        };

        const result = resolveProcessor({
            value,
            current,
            dirname,
        });

        expect(result).toMatchSnapshot();
    });
});
