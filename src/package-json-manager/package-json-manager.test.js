/* @flow */

import path from 'path';
import fs from 'fs';

require('./package-json-manager');

const packageJsonManager = (presets, previousManagedKeys) =>
    require('./package-json-manager').packageJsonManager(
        presets,
        previousManagedKeys,
    );

describe('packageJsonManager', () => {
    const cwd = process.cwd();
    let writeFileSync;

    beforeEach(() => {
        jest.mock('../utils/log', () => ({
            warn: jest.fn(),
            info: jest.fn(),
            error: jest.fn(),
            success: jest.fn(),
        }));

        jest.mock('fs-extra', () => ({
            move: jest.fn(() => Promise.resolve()),
        }));

        /**
         * Before calling '.toMatchSnapshot();' snapshot, call 'writeFileSync.mockRestore();'
         * otherwise snapshot will not write
         */
        writeFileSync = jest
            .spyOn(fs, 'writeFileSync')
            .mockImplementation(() => jest.fn());
    });

    afterEach(() => {
        process.chdir(cwd);
    });

    test('handles undefined', async () => {
        const dir = path.resolve(__dirname, '__sandbox__/package-json-1/');
        process.chdir(dir);

        const result = await packageJsonManager();

        const writeFileSyncCalls = writeFileSync.mock.calls;

        writeFileSync.mockRestore();

        expect(writeFileSyncCalls).toEqual([]);
        expect(result).toEqual({});
    });

    test('adds custom scripts when they do not exist prior', async () => {
        const dir = path.resolve(__dirname, '__sandbox__/package-json-1/');
        process.chdir(dir);

        const lifecycles = {
            packageJson: [
                {
                    scripts: {
                        'lint.fix': 'eslint --fix',
                    },
                },
            ],
        };

        const result = await packageJsonManager(lifecycles);

        const writeFileSyncCalls = writeFileSync.mock.calls;

        writeFileSync.mockRestore();

        expect(writeFileSyncCalls).toMatchSnapshot();
        expect(result).toEqual({ scripts: { 'lint.fix': 'eslint --fix' } });
    });

    test('removes empty npm defaults', async () => {
        const dir = path.resolve(__dirname, '__sandbox__/package-json-1/');
        process.chdir(dir);

        const lifecycles = {
            packageJson: [
                {
                    license: '',
                    scripts: {
                        'lint.fix': 'eslint --fix',
                        test: null,
                    },
                },
            ],
        };

        const result = await packageJsonManager(lifecycles);

        const writeFileSyncCalls = writeFileSync.mock.calls;

        writeFileSync.mockRestore();

        expect(writeFileSyncCalls).toMatchSnapshot();
        expect(result).toEqual({
            license: '',
            scripts: {
                test: null,
                'lint.fix': 'eslint --fix',
            },
        });
    });

    test('setting null does not always update packageJson if already removed', async () => {
        const dir = path.resolve(__dirname, '__sandbox__/package-json-6/');
        process.chdir(dir);

        const lifecycles = {
            packageJson: [
                {
                    scripts: {
                        test: null,
                    },
                },
            ],
        };

        const result = await packageJsonManager(lifecycles);

        const writeFileSyncCalls = writeFileSync.mock.calls;

        writeFileSync.mockRestore();

        expect(writeFileSyncCalls).toMatchSnapshot();
        expect(result).toEqual({ scripts: { test: null } });
    });
});
