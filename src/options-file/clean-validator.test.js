/* @flow */

import path from 'path';

const cleanValidator = (args) =>
    require('./clean-validator').cleanValidator(args);

describe('cleanValidator', () => {
    const cwd = process.cwd();
    const dir = path.resolve(__dirname, '../clean/__sandbox__/1/');

    beforeEach(() => {
        process.chdir(dir);
    });

    afterEach(() => {
        process.chdir(cwd);
    });

    test('fails with relative ../', () => {
        const value = [
            {
                del: ['../src/**'],
                makeDirs: [],
            },
        ];

        try {
            expect.hasAssertions();
            cleanValidator({ value });
        } catch (error) {
            expect(error).toMatchSnapshot();
        }
    });

    test('fails with absolute inside rootPath', () => {
        const value = [
            {
                del: [path.resolve(dir, 'src/**')],
                makeDirs: [],
            },
        ];

        try {
            expect.hasAssertions();
            cleanValidator({ value });
        } catch (error) {
            expect(error).toMatchSnapshot();
        }
    });

    test('fails with absolute', () => {
        process.chdir(__dirname);
        const value = [
            {
                del: [path.resolve(__dirname, '__sandbox__/should_fail')],
                makeDirs: [],
            },
        ];

        try {
            expect.hasAssertions();
            cleanValidator({ value });
        } catch (error) {
            expect(error).toMatchSnapshot();
        }
    });

    test('fails with absolute + relative', () => {
        process.chdir(__dirname);
        const value = [
            {
                del: [path.resolve(__dirname, '__sandbox__/1/../dist/')],
                makeDirs: [],
            },
        ];

        try {
            expect.hasAssertions();
            cleanValidator({ value });
        } catch (error) {
            expect(error).toMatchSnapshot();
        }
    });

    test('makeDirs fails', () => {
        process.chdir(__dirname);
        const value = [
            {
                del: [],
                makeDirs: [path.resolve(__dirname, '__sandbox__/1/../dist/')],
            },
        ];

        try {
            expect.hasAssertions();
            cleanValidator({ value });
        } catch (error) {
            expect(error).toMatchSnapshot();
        }
    });

    test('passes with just del', () => {
        const value = [
            {
                del: ['*'],
                makeDirs: [],
            },
        ];

        const result = cleanValidator({ value });
        expect(result).toEqual(undefined);
    });

    test('passes with del glob', () => {
        const value = [
            {
                del: ['!.git'],
                makeDirs: [],
            },
        ];

        const result = cleanValidator({ value });
        expect(result).toEqual(undefined);
    });

    test('passes with just makeDirs', () => {
        const value = [
            {
                del: [],
                makeDirs: ['fake/dir/'],
            },
        ];

        const result = cleanValidator({ value });
        expect(result).toEqual(undefined);
    });
});
