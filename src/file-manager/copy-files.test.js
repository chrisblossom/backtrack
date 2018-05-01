/* @flow */

import path from 'path';
import { fileInfo } from './file-test-utils';

const copyFiles = (files, previousStats) =>
    require('./copy-files').copyFiles(files, previousStats);

describe('copyFiles', () => {
    const cwd = process.cwd();
    let copy;

    beforeEach(() => {
        // $FlowIssue
        copy = require.requireMock('fs-extra').copy;

        jest.mock('fs-extra', () => ({
            copy: jest.fn(() => Promise.resolve()),
        }));

        jest.mock('../utils/log', () => ({
            warn: jest.fn(),
            info: jest.fn(),
            error: jest.fn(),
            success: jest.fn(),
        }));
    });

    afterEach(() => {
        process.chdir(cwd);
    });

    test('copies only changed files', async () => {
        const dir = path.resolve(__dirname, '__sandbox__/stats1/');
        process.chdir(dir);

        const files = [
            {
                src: path.resolve(dir, 'nested/inside.js'),
                dest: 'nested/inside.js',
            },
            {
                src: path.resolve(dir, 'file1.js'),
                dest: 'file11.js',
            },
        ];

        const { parsedFiles, previousStats } = fileInfo(files);

        await copyFiles(parsedFiles, previousStats);

        expect(copy.mock.calls).toMatchSnapshot();
    });

    test('copies nothing if nothing changed', async () => {
        const dir = path.resolve(__dirname, '__sandbox__/stats1/');
        process.chdir(dir);

        const files = [
            {
                src: path.resolve(dir, 'nested/inside.js'),
                dest: 'nested/inside.js',
            },
            {
                src: path.resolve(dir, 'file1.js'),
                dest: 'file1.js',
            },
        ];

        const { parsedFiles, previousStats } = fileInfo(files);

        await copyFiles(parsedFiles, previousStats);

        expect(copy.mock.calls).toEqual([]);
    });

    test('copies all if all changed', async () => {
        const dir = path.resolve(__dirname, '__sandbox__/stats1/');
        process.chdir(dir);

        const files = [
            {
                src: path.resolve(dir, 'nested/inside.js'),
                dest: 'nested/inside1.js',
            },
            {
                src: path.resolve(dir, 'file1.js'),
                dest: 'file11.js',
            },
        ];

        const { parsedFiles, previousStats } = fileInfo(files);

        await copyFiles(parsedFiles, previousStats);

        expect(copy.mock.calls).toMatchSnapshot();
    });

    test('allowChanges - create file with -latest tag', async () => {
        const dir = path.resolve(__dirname, '__sandbox__/stats1/');
        process.chdir(dir);

        const files = [
            {
                src: path.resolve(dir, 'nested/other.js'),
                dest: 'nested/inside.js',
                allowChanges: true,
            },
            {
                src: path.resolve(dir, 'file1.js'),
                dest: 'file11.js',
            },
        ];

        const { parsedFiles, previousStats } = fileInfo(files);

        await copyFiles(parsedFiles, previousStats);

        expect(copy.mock.calls).toMatchSnapshot();
    });

    test('allowChanges - if srcHash is equal to previousHash, do nothing', async () => {
        const dir = path.resolve(__dirname, '__sandbox__/stats1/');
        process.chdir(dir);

        const previousFiles = [
            {
                src: path.resolve(dir, 'nested/other.js'),
                dest: 'nested/file1.js',
                allowChanges: true,
            },
        ];

        const files = [
            {
                src: path.resolve(dir, 'nested/other.js'),
                dest: 'nested/file1.js',
                allowChanges: true,
            },
        ];

        const { parsedFiles, previousStats } = fileInfo(files, previousFiles);

        await copyFiles(parsedFiles, previousStats);

        expect(copy.mock.calls).toEqual([]);
    });

    test('allowChanges - copies if does not exist', async () => {
        const dir = path.resolve(__dirname, '__sandbox__/stats1/');
        process.chdir(dir);

        const files = [
            {
                src: path.resolve(dir, 'nested/other.js'),
                dest: 'nested/missing.js',
                allowChanges: true,
            },
        ];

        const { parsedFiles, previousStats } = fileInfo(files);

        await copyFiles(parsedFiles, previousStats);

        expect(copy.mock.calls).toMatchSnapshot();
    });

    test('allowChanges - copies if destFile has not been modified', async () => {
        const dir = path.resolve(__dirname, '__sandbox__/stats1/');
        process.chdir(dir);

        const previousFiles = [
            {
                src: path.resolve(dir, 'nested/inside.js'),
                dest: 'nested/inside.js',
                allowChanges: true,
            },
        ];

        const files = [
            {
                src: path.resolve(dir, 'nested/other.js'),
                dest: 'nested/inside.js',
                allowChanges: true,
            },
        ];

        const { parsedFiles, previousStats } = fileInfo(files, previousFiles);

        await copyFiles(parsedFiles, previousStats);

        expect(copy.mock.calls).toMatchSnapshot();
    });
});