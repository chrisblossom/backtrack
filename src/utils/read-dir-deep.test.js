/* @flow */

import path from 'path';
import { readDirDeep, readDirDeepSync } from './read-dir-deep';

describe('read-dir-deep', () => {
    describe('gets all nested files', () => {
        const pathname = path.resolve(__dirname, '__sandbox__/files1');

        const checkResult = (result) => {
            expect(result).toEqual([
                'nested/nested-inside/inside.js',
                'nested/other.js',
                'test-file.js',
            ]);
        };

        test('async', async () => {
            const result = await readDirDeep(pathname);
            checkResult(result);
        });

        test('sync', () => {
            const result = readDirDeepSync(pathname);

            checkResult(result);
        });
    });

    describe('throws error when not a directory', () => {
        const pathname = path.resolve(
            __dirname,
            '__sandbox__/files1/test-file.js',
        );

        const checkError = (error) => {
            expect(error.code).toEqual('ENOTDIR');
        };

        test('async', async () => {
            expect.hasAssertions();
            try {
                await readDirDeep(pathname);
            } catch (error) {
                checkError(error);
            }
        });

        test('sync', () => {
            expect.hasAssertions();
            try {
                readDirDeepSync(pathname);
            } catch (error) {
                checkError(error);
            }
        });
    });
});
