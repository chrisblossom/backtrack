import path from 'path';
import { realpathSync } from 'fs';
import del from 'del';
import os from 'os';
import fse from 'fs-extra';
import { getRandomInteger } from '../utils/get-random-number';
import { fileInfo } from './file-test-utils';

const fileManager = (copyFiles?: any, previousStats?: any) =>
    require('./file-manager').fileManager(copyFiles, previousStats);

describe('fileManger', () => {
    const cwd = process.cwd();
    /**
     * Use os.tmpdir instead of __sandbox__ because Jest cannot ignore dynamic created files in watch mode
     * https://github.com/facebook/jest/issues/3923
     *
     * Use random dir name to ensure unique
     */
    const dir = path.resolve(
        realpathSync(os.tmpdir()),
        'backtrack',
        `cwd_${getRandomInteger()}`,
    );

    beforeEach(async () => {
        jest.mock('../utils/log', () => ({
            warn: jest.fn(),
            info: jest.fn(),
            error: jest.fn(),
            success: jest.fn(),
        }));

        await fse.ensureDir(dir);

        process.chdir(dir);

        await fse.copy(path.resolve(__dirname, '__sandbox__/app1/'), dir);
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

    test('handles undefined files', async () => {
        const result = await fileManager();

        expect(result).toEqual({});
    });

    test('creates file', async () => {
        const files = require(path.resolve(dir, 'backtrack.config')).files;

        const { parsedFiles } = fileInfo(files);

        const result = await fileManager(parsedFiles);

        expect(result).toMatchSnapshot();
    });
});
