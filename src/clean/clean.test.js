/* @flow */

import path from 'path';

require('./clean');
require('../options-file/clean-processor');
require('../options-file/clean-preprocessor');

const rawClean = (args) => require('./clean').clean(args);
const cleanParser = (args) =>
    require('../options-file/clean-processor').cleanProcessor(args);
const cleanPreprocessor = (args) =>
    require('../options-file/clean-preprocessor').cleanPreprocessor(args);

function clean(files) {
    const normalized = cleanPreprocessor({ value: files });
    const parsed = cleanParser({ value: normalized });

    return rawClean(parsed);
}

describe('clean', () => {
    const cwd = process.cwd();
    let del;
    let ensureDir;
    let copy;

    beforeEach(() => {
        jest.doMock('../utils/log', () => ({
            warn: jest.fn(),
            info: jest.fn(),
            error: jest.fn(),
            success: jest.fn(),
        }));

        jest.doMock('del', () =>
            jest.fn((pattern, options = {}) => {
                // $FlowIssue
                const delActual = require.requireActual('del');

                return delActual(pattern, {
                    ...options,
                    dryRun: true,
                });
            }),
        );
        // $FlowIssue
        del = require.requireMock('del');

        jest.doMock('fs-extra', () => ({
            ensureDir: jest.fn(() => Promise.resolve()),
            copy: jest.fn(() => Promise.resolve()),
        }));

        // $FlowIssue
        ensureDir = require.requireMock('fs-extra').ensureDir;
        // $FlowIssue
        copy = require.requireMock('fs-extra').copy;
    });

    afterEach(() => {
        process.chdir(cwd);
    });

    test('handles undefined', async () => {
        const dir = path.resolve(__dirname, '__sandbox__/1/');
        process.chdir(dir);

        await rawClean();

        expect(del.mock.calls).toMatchSnapshot();
        expect(ensureDir.mock.calls).toEqual([]);
    });

    test('handles one clean', async () => {
        const dir = path.resolve(__dirname, '__sandbox__/1/');
        process.chdir(dir);

        const options = {
            del: ['**/*'],
            makeDirs: ['nested/', 'another_nested/folder'],
            copy: [
                {
                    src: 'static',
                    dest: 'static',
                    hash: true,
                },
            ],
        };

        await clean(options);

        expect(del.mock.calls).toMatchSnapshot();
        expect(ensureDir.mock.calls).toMatchSnapshot();
        expect(copy.mock.calls).toMatchSnapshot();
    });

    test('handles multiple clean', async () => {
        const dir = path.resolve(__dirname, '__sandbox__/1/');
        process.chdir(dir);

        const options = [
            {
                del: ['**/*', '!.git'],
                makeDirs: ['nested/', 'another_nested/folder'],
                copy: [
                    {
                        src: 'static',
                        dest: 'static',
                        hash: true,
                    },
                ],
            },
            {
                del: ['!two.js'],
            },
            {
                makeDirs: ['another_two_nested/folder'],
            },
            {
                copy: [
                    {
                        src: 'outside-build.js',
                        dest: 'static/outside-build.js',
                    },
                ],
            },
        ];

        const normalized = cleanPreprocessor({ value: options });
        const parsed = cleanParser({ value: normalized });

        await clean(parsed);

        expect(del.mock.calls).toMatchSnapshot();
        expect(ensureDir.mock.calls).toMatchSnapshot();
        expect(copy.mock.calls).toMatchSnapshot();
    });

    test('handles empty del', async () => {
        const dir = path.resolve(__dirname, '__sandbox__/1/');
        process.chdir(dir);

        const options = [
            {
                makeDirs: ['nested/', 'another_nested/folder'],
            },
        ];

        await clean(options);

        expect(del.mock.calls).toMatchSnapshot();
        expect(ensureDir.mock.calls).toMatchSnapshot();
    });

    test('handles empty makeDirs', async () => {
        const dir = path.resolve(__dirname, '__sandbox__/1/');
        process.chdir(dir);

        const options = [
            {
                del: ['**/*'],
            },
        ];

        await clean(options);

        expect(del.mock.calls).toMatchSnapshot();
        expect(ensureDir.mock.calls).toEqual([]);
    });

    test('merges duplicates in correct order', async () => {
        const dir = path.resolve(__dirname, '__sandbox__/1/');
        process.chdir(dir);

        const options = [
            {
                del: ['duplicate/file', 'unique/file', 'duplicate/file'],
                makeDirs: ['duplicate/dir', 'unique/dir', 'duplicate/dir'],
            },
        ];

        await clean(options);

        expect(del.mock.calls).toMatchSnapshot();
        expect(ensureDir.mock.calls).toMatchSnapshot();
    });
});
