import path from 'path';

const getFileStats = (files: any) =>
    require('./get-file-stats').getFileStats(files);
const filesParser = (args: any) =>
    require('../options-file/files-post-processor').filesPostProcessor(args);

describe('getFileStats', () => {
    const cwd = process.cwd();

    afterEach(() => {
        process.chdir(cwd);
    });

    test('returns file stats', () => {
        const dir = path.resolve(__dirname, '__sandbox__/stats1/');
        process.chdir(dir);

        const value = [
            {
                src: 'nested/other.js',
                dest: 'nested/other.js',
            },
            {
                src: 'nested/inside.js',
                dest: 'nested/two/inside.js',
            },
            {
                src: 'z-file2.js',
                dest: 'z-file2.js',
            },
            {
                src: 'file1.js',
                dest: 'file1.js',
            },
            {
                makeDirs: ['dist', 'src'],
            },
        ];

        const parsedFiles = filesParser({ value });

        const result = getFileStats(parsedFiles);

        expect(result).toMatchSnapshot();
    });

    test('removes files when none exist', () => {
        const dir = path.resolve(__dirname, '__sandbox__/stats1/');
        process.chdir(dir);

        const value = [
            {
                makeDirs: ['dist', 'src'],
            },
        ];

        const parsedFiles = filesParser({ value });

        const result = getFileStats(parsedFiles);

        expect(result).toMatchSnapshot();
    });

    test('removes makeDirs when none exist', () => {
        const dir = path.resolve(__dirname, '__sandbox__/stats1/');
        process.chdir(dir);

        const value = [
            {
                src: 'file1.js',
                dest: 'file1.js',
            },
        ];

        const parsedFiles = filesParser({ value });

        const result = getFileStats(parsedFiles);

        expect(result).toMatchSnapshot();
    });

    test('returns empty object when no stats', () => {
        const dir = path.resolve(__dirname, '__sandbox__/stats1/');
        process.chdir(dir);

        const value: Array<void> = [];

        const parsedFiles = filesParser({ value });

        const result = getFileStats(parsedFiles);

        expect(result).toMatchSnapshot();
    });
});
