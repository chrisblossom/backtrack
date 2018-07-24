/* @flow */

import path from 'path';
import fs from 'fs';

const writePackageJson = (packageJson) =>
    require('./write-package-json').writePackageJson(packageJson);

describe('writePackageJson', () => {
    const cwd = process.cwd();
    let writeFileSync;

    beforeEach(() => {
        jest.mock('../utils/log', () => ({
            warn: jest.fn(),
            info: jest.fn(),
            error: jest.fn(),
            success: jest.fn(),
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

    test('writes package json', () => {
        const dir = path.resolve(__dirname, '__sandbox__/package-json-1/');
        process.chdir(dir);

        const fakePackageJson = {
            scripts: {
                dev: 'run dev',
            },
        };

        const result = writePackageJson(fakePackageJson);

        const writeFileSyncCalls = writeFileSync.mock.calls;

        writeFileSync.mockRestore();

        expect(writeFileSyncCalls).toMatchSnapshot();
        expect(result).toEqual(undefined);
    });
});
