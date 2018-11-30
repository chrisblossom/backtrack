import path from 'path';
import { fileInfo } from './file-test-utils';

require('./backup-changed-files');

const backupChangedFiles = (files: any, previousStats: any) =>
    require('./backup-changed-files').backupChangedFiles(files, previousStats);

describe('backupChangedFiles', () => {
    const cwd = process.cwd();
    let move: any;

    beforeEach(() => {
        move = require.requireMock('fs-extra').move;

        jest.mock('fs-extra', () => ({
            move: jest.fn(() => Promise.resolve()),
        }));

        jest.mock('../utils/log', () => ({
            warn: jest.fn(),
        }));
    });

    afterEach(() => {
        process.chdir(cwd);
    });

    test('backups files with different hashes', async () => {
        const dir = path.resolve(__dirname, '__sandbox__/stats1/');
        process.chdir(dir);

        const files = [
            {
                src: path.resolve(dir, 'file1.js'),
                dest: 'nested/other.js',
            },
        ];

        const { parsedFiles, previousStats } = fileInfo(files);

        await backupChangedFiles(parsedFiles, previousStats);

        expect(move.mock.calls).toMatchSnapshot();
    });

    test('does not backup if changes allowed', async () => {
        const dir = path.resolve(__dirname, '__sandbox__/stats1/');
        process.chdir(dir);

        const previousFiles = [
            {
                src: path.resolve(dir, 'nested/other.js'),
                dest: 'nested/other.js',
                allowChanges: true,
            },
        ];

        const files = [
            {
                src: path.resolve(dir, 'file1.js'),
                dest: 'nested/other.js',
                allowChanges: true,
            },
        ];

        const { parsedFiles, previousStats } = fileInfo(files, previousFiles);

        await backupChangedFiles(parsedFiles, previousStats);

        expect(move.mock.calls).toEqual([]);
    });

    test('does not backup if changes allowed and not previously managed', async () => {
        const dir = path.resolve(__dirname, '__sandbox__/stats1/');
        process.chdir(dir);

        const files = [
            {
                src: path.resolve(dir, 'file1.js'),
                dest: 'nested/other.js',
                allowChanges: true,
            },
        ];

        const { parsedFiles, previousStats } = fileInfo(files);

        await backupChangedFiles(parsedFiles, previousStats);

        expect(move.mock.calls).toEqual([]);
    });

    test('no previousStats - backup if file exists', async () => {
        const dir = path.resolve(__dirname, '__sandbox__/stats1/');
        process.chdir(dir);

        const files = [
            {
                src: path.resolve(dir, 'file1.js'),
                dest: 'nested/other.js',
            },
        ];

        const { parsedFiles, previousStats } = fileInfo(files);

        await backupChangedFiles(parsedFiles, previousStats);

        expect(move.mock.calls).toMatchSnapshot();
    });

    test('no previousStats - dest does not exist', async () => {
        const dir = path.resolve(__dirname, '__sandbox__/stats1/');
        process.chdir(dir);

        const files = [
            {
                src: path.resolve(dir, 'file1.js'),
                dest: 'nested/missing.js',
                allowChanges: true,
            },
        ];

        const { parsedFiles, previousStats } = fileInfo(files);

        await backupChangedFiles(parsedFiles, previousStats);

        expect(move.mock.calls).toEqual([]);
    });

    test('no previousStats - dest is same file', async () => {
        const dir = path.resolve(__dirname, '__sandbox__/stats1/');
        process.chdir(dir);

        const files = [
            {
                src: path.resolve(dir, 'file1.js'),
                dest: 'file1.js',
                allowChanges: true,
            },
        ];

        const { parsedFiles, previousStats } = fileInfo(files);

        await backupChangedFiles(parsedFiles, previousStats);

        expect(move.mock.calls).toEqual([]);
    });

    test('does nothing if updated file matches target file hash', async () => {
        const dir = path.resolve(__dirname, '__sandbox__/stats1/');
        process.chdir(dir);

        const files = [
            {
                src: path.resolve(dir, 'nested/file1.js'),
                dest: 'file1.js',
            },
        ];

        const { parsedFiles } = fileInfo(files);

        const previousStats = {
            'file1.js': 'fake_hash',
        };

        const result = await backupChangedFiles(parsedFiles, previousStats);

        expect(move.mock.calls).toEqual([]);
        expect(result).toBeUndefined();
    });

    test('does nothing if file does not exist', async () => {
        const dir = path.resolve(__dirname, '__sandbox__/stats1/');
        process.chdir(dir);

        const files = [
            {
                src: path.resolve(dir, 'nested/inside.js'),
                dest: 'nested/does_not_exist.js',
            },
        ];

        const { parsedFiles, previousStats } = fileInfo(files);

        const result = await backupChangedFiles(parsedFiles, previousStats);

        expect(move.mock.calls).toEqual([]);
        expect(result).toBeUndefined();
    });

    test('does nothing if no files changed', async () => {
        const dir = path.resolve(__dirname, '__sandbox__/stats1/');
        process.chdir(dir);

        const files = [
            {
                src: path.resolve(dir, 'nested/other.js'),
                dest: 'nested/other.js',
            },
        ];

        const { parsedFiles, previousStats } = fileInfo(files);

        const result = await backupChangedFiles(parsedFiles, previousStats);

        expect(move.mock.calls).toEqual([]);
        expect(result).toBeUndefined();
    });
});
