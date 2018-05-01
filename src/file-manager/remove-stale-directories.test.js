/* @flow */

import os from 'os';
import path from 'path';
import del from 'del';
import fse from 'fs-extra';
import { realpathSync } from 'fs';
import { getRandomInteger } from '../utils/get-random-number';

const filesPreprocessor = (args) =>
    require('../options-file/files-preprocessor').filesPreprocessor(args);
const filesPostProcessor = (args) =>
    // $FlowIgnore
    require('../options-file/files-post-processor').filesPostProcessor(args);
const getFileStats = (parsedFiles) =>
    require('./get-file-stats').getFileStats(parsedFiles);
const removeStaleDirectories = (parsedFiles, previousStats) =>
    require('./remove-stale-directories').removeStaleDirectories(
        parsedFiles,
        previousStats,
    );

async function dirInfo(files = [], previousFiles = []) {
    const dirname = process.cwd();
    const normalizedPrevious = filesPreprocessor({
        value: previousFiles,
        dirname,
    });

    const parsedPreviousFiles = filesPostProcessor({
        value: normalizedPrevious,
        dirname,
    });

    const pending = parsedPreviousFiles.makeDirs.map((dir) =>
        fse.ensureDir(dir),
    );

    await Promise.all(pending);

    const previousStats = getFileStats(parsedPreviousFiles).directories;

    const normalizedFiles = filesPreprocessor({ value: files, dirname });

    const parsedFiles = filesPostProcessor({ value: normalizedFiles });

    return {
        previousStats,
        parsedFiles,
    };
}

describe('removeStaleDirectories', () => {
    const cwd = process.cwd();
    let delMock;

    const dir = path.resolve(
        realpathSync(os.tmpdir()),
        'backtrack',
        `cwd_${getRandomInteger()}`,
    );

    beforeEach(async () => {
        // $FlowIssue
        delMock = require.requireMock('del');
        jest.mock('del', () =>
            jest.fn((dirs) => {
                // $FlowIssue
                const delActual = require.requireActual('del');

                return delActual(dirs);
            }),
        );

        jest.mock('../utils/log', () => ({
            warn: jest.fn(),
            info: jest.fn(),
            error: jest.fn(),
            success: jest.fn(),
        }));

        await fse.ensureDir(dir);

        process.chdir(dir);
    });

    afterEach(async () => {
        await del(path.resolve(dir, '**/*'), {
            dot: true,
        });

        process.chdir(cwd);
    });

    afterAll(async () => {
        process.chdir(path.resolve(dir, '../'));

        await del(dir, {
            dot: true,
        });

        process.chdir(cwd);
    });

    test('removes full file tree', async () => {
        const previousFiles = [{ makeDirs: ['dist/static'] }];
        const files = [];

        const { parsedFiles, previousStats } = await dirInfo(
            files,
            previousFiles,
        );

        await removeStaleDirectories(parsedFiles, previousStats);

        expect(delMock.mock.calls).toMatchSnapshot();
    });

    test('removes full file tree with multiple nested', async () => {
        const previousFiles = [{ makeDirs: ['dist/static', 'dist/inside'] }];
        const files = [];

        const { parsedFiles, previousStats } = await dirInfo(
            files,
            previousFiles,
        );

        await removeStaleDirectories(parsedFiles, previousStats);

        expect(delMock.mock.calls).toMatchSnapshot();
    });

    test('removes top next directory, but leaves sub managed directory', async () => {
        const previousFiles = [{ makeDirs: ['dist/static'] }];
        const files = [{ makeDirs: ['dist'] }];

        const { parsedFiles, previousStats } = await dirInfo(
            files,
            previousFiles,
        );

        await removeStaleDirectories(parsedFiles, previousStats);

        expect(delMock.mock.calls).toMatchSnapshot();
    });

    test('leaves directory if files exist', async () => {
        const previousFiles = [{ makeDirs: ['dist'] }];
        const files = [];

        const { parsedFiles, previousStats } = await dirInfo(
            files,
            previousFiles,
        );

        const file = path.resolve(dir, 'dist', 'file1.js');
        await fse.writeJson(file, {});

        await removeStaleDirectories(parsedFiles, previousStats);

        expect(delMock.mock.calls).toEqual([]);
    });

    test('leaves directory if files exist - hidden files', async () => {
        const previousFiles = [{ makeDirs: ['dist'] }];
        const files = [];

        const { parsedFiles, previousStats } = await dirInfo(
            files,
            previousFiles,
        );

        const file = path.resolve(dir, 'dist', '.hidden.js');
        await fse.writeJson(file, {});

        await removeStaleDirectories(parsedFiles, previousStats);

        expect(delMock.mock.calls).toEqual([]);
    });

    test('does nothing if directory does not exist but removes root', async () => {
        const previousFiles = [{ makeDirs: ['dist/static'] }];
        const files = [];

        const { parsedFiles, previousStats } = await dirInfo(
            files,
            previousFiles,
        );

        const dirPath = path.resolve(dir, 'dist', 'static');
        await del(dirPath);

        await removeStaleDirectories(parsedFiles, previousStats);

        expect(delMock.mock.calls).toMatchSnapshot();
    });
});