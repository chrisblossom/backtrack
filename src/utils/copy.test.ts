import path from 'path';
import { copyFormatMockCalls } from './copy-format-mock-calls';
import { File } from './copy';

require('./copy');

const copy = (files: ReadonlyArray<File> | File) =>
    require('./copy').copy(files);

describe('copy', () => {
    let fseCopySpy: any;
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
        expect(copyFormatMockCalls(fseCopySpy.mock.calls)).toMatchSnapshot();
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

        expect(copyFormatMockCalls(fseCopySpy.mock.calls)).toMatchSnapshot();
    });

    test('adds hash to dest with hash: true', async () => {
        const files = {
            src: path.normalize('./files1/test-file.js'),
            dest: path.normalize('./build/static/test-file.js'),
            hash: true,
        };

        await copy(files);

        expect(copyFormatMockCalls(fseCopySpy.mock.calls)).toMatchSnapshot();
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

        expect(copyFormatMockCalls(fseCopySpy.mock.calls)).toMatchSnapshot();
    });

    test('copies directory of files with hashes', async () => {
        const files = {
            src: path.normalize('./files1'),
            dest: path.normalize('./build/static'),
            hash: true,
        };

        await copy(files);

        expect(copyFormatMockCalls(fseCopySpy.mock.calls)).toMatchSnapshot();
    });
});
