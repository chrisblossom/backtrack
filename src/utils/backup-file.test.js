/* @flow */

import path from 'path';

require('./backup-file');

const backupFile = (files) => require('./backup-file').backupFile(files);

describe('backupFile', () => {
    const dir = path.resolve(__dirname, '__sandbox__/backup-file/');
    const cwd = process.cwd();
    let move;

    beforeEach(() => {
        // $FlowIssue
        move = require.requireMock('fs-extra').move;

        jest.mock('fs-extra', () => ({
            move: jest.fn(() => Promise.resolve()),
        }));

        jest.mock('../utils/log', () => ({
            warn: jest.fn(),
        }));

        process.chdir(dir);
    });

    afterEach(() => {
        process.chdir(cwd);
    });

    test('backups file', async () => {
        const file = path.resolve(dir, 'file1.js');

        const result = await backupFile(file);

        expect(result).toMatchSnapshot();
        expect(move.mock.calls).toMatchSnapshot();
    });

    test('backups file inside nested folder', async () => {
        const file = path.resolve(dir, 'nested/nested-file1.js');

        const result = await backupFile(file);

        expect(result).toMatchSnapshot();
        expect(move.mock.calls).toMatchSnapshot();
    });

    test('does nothing if backup file already exists and hash matches', async () => {
        const file = path.resolve(dir, 'file2.js');

        const result = await backupFile(file);

        expect(result).toEqual(undefined);
        expect(move.mock.calls).toEqual([]);
    });

    test('appends -NUM to file when backed up file is modified', async () => {
        const file = path.resolve(dir, 'file3.js');

        const result = await backupFile(file);

        expect(result).toMatchSnapshot();
        expect(move.mock.calls).toMatchSnapshot();
    });

    test('will fail if count >= 10', async () => {
        const file = path.resolve(dir, 'existing/file4.js');

        try {
            expect.hasAssertions();
            await backupFile(file);
        } catch (error) {
            expect(error).toMatchSnapshot();
            expect(move.mock.calls).toEqual([]);
        }
    });
});
