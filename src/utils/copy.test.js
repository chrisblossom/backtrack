/* @flow */

import path from 'path';

const copy = (files) => require('./copy').copy(files);

const sortArray = (arr) => {
    const result = arr.sort((a, b) => {
        const relativeA = path.relative(process.cwd(), a[0]);
        const relativeB = path.relative(process.cwd(), b[0]);

        return relativeA.localeCompare(relativeB);
    });

    return result;
};

describe('copy', () => {
    let fseCopySpy;
    const cwd = process.cwd();
    const workingCwd = path.resolve(__dirname, '__sandbox__');

    beforeEach(() => {
        const fse = require('fs-extra');
        fseCopySpy = jest
            .spyOn(fse, 'copy')
            .mockImplementation(() => Promise.resolve());

        process.chdir(workingCwd);
    });

    afterEach(() => {
        process.chdir(cwd);
        jest.restoreAllMocks();
    });

    test('copies files', async () => {
        const files = {
            src: path.resolve('files1/test-file.js'),
            dest: path.resolve('build/static/test-file.js'),
        };

        const result = await copy(files);

        expect(result).toEqual(undefined);
        expect(fseCopySpy.mock.calls).toEqual(
            sortArray([
                [
                    path.resolve('./files1/test-file.js'),
                    path.resolve('./build/static/test-file.js'),
                    {
                        errorOnExist: true,
                        overwrite: true,
                        preserveTimestamps: true,
                    },
                ],
            ]),
        );
    });

    test('passes options to fse.copy', async () => {
        const files = {
            src: path.normalize('./files1/test-file.js'),
            dest: path.normalize('./build/static/test-file.js'),

            overwrite: false,
            errorOnExist: false,
            preserveTimestamps: false,
        };

        await copy(files);

        expect(fseCopySpy.mock.calls).toEqual(
            sortArray([
                [
                    path.normalize('./files1/test-file.js'),
                    path.normalize('./build/static/test-file.js'),
                    {
                        errorOnExist: false,
                        overwrite: false,
                        preserveTimestamps: false,
                    },
                ],
            ]),
        );
    });

    test('adds hash to dest with hash: true', async () => {
        const files = {
            src: path.normalize('./files1/test-file.js'),
            dest: path.normalize('./build/static/test-file.js'),
            hash: true,
        };

        await copy(files);

        expect(fseCopySpy.mock.calls).toEqual(
            sortArray([
                [
                    path.normalize('./files1/test-file.js'),
                    path.normalize('./build/static/test-file.b2c22cd6.js'),
                    {
                        errorOnExist: true,
                        overwrite: true,
                        preserveTimestamps: true,
                    },
                ],
            ]),
        );
    });

    test('copies directory of files', async () => {
        const files = {
            src: path.normalize('./files1'),
            dest: path.normalize('./build/static'),
            overwrite: false,
            errorOnExist: false,
            preserveTimestamps: false,
        };

        await copy(files);

        const expectedOptions = {
            overwrite: false,
            errorOnExist: false,
            preserveTimestamps: false,
        };

        expect(fseCopySpy.mock.calls).toEqual(
            sortArray([
                [
                    path.resolve(
                        workingCwd,
                        'files1/nested/nested-inside/inside.js',
                    ),
                    path.resolve(
                        workingCwd,
                        'build/nested/nested-inside/inside.js',
                    ),
                    expectedOptions,
                ],
                [
                    path.resolve(workingCwd, 'files1/nested/other.js'),
                    path.resolve(workingCwd, 'build/nested/other.js'),
                    expectedOptions,
                ],
                [
                    path.resolve(workingCwd, 'files1/test-file.js'),
                    path.resolve(workingCwd, 'build/test-file.js'),
                    expectedOptions,
                ],
            ]),
        );
    });

    test('copies directory of files with hashes', async () => {
        const files = {
            src: path.normalize('./files1'),
            dest: path.normalize('./build/static'),
            hash: true,
        };

        await copy(files);

        const expectedOptions = {
            overwrite: true,
            errorOnExist: true,
            preserveTimestamps: true,
        };

        expect(fseCopySpy.mock.calls).toEqual(
            sortArray([
                [
                    path.resolve(
                        workingCwd,
                        'files1/nested/nested-inside/inside.js',
                    ),
                    path.resolve(
                        workingCwd,
                        'build/nested/nested-inside/inside.f7d8aade.js',
                    ),
                    expectedOptions,
                ],
                [
                    path.resolve(workingCwd, 'files1/nested/other.js'),
                    path.resolve(workingCwd, 'build/nested/other.4a98043a.js'),
                    expectedOptions,
                ],
                [
                    path.resolve(workingCwd, 'files1/test-file.js'),
                    path.resolve(workingCwd, 'build/test-file.b2c22cd6.js'),
                    expectedOptions,
                ],
            ]),
        );
    });
});
