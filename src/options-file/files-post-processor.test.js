/* @flow */

import path from 'path';

const filesPostProcessor = (copyFiles) =>
    require('./files-post-processor').filesPostProcessor(copyFiles);

describe('filesPostProcessor', () => {
    const cwd = process.cwd();

    afterEach(() => {
        process.chdir(cwd);
    });

    test('handles undefined', () => {
        const dir = path.resolve(
            __dirname,
            '../file-manager/__sandbox__/stats1/',
        );
        process.chdir(dir);

        const result = filesPostProcessor();

        expect(result).toMatchSnapshot();
    });

    test('returns new object', () => {
        const dir = path.resolve(
            __dirname,
            '../file-manager/__sandbox__/stats1/',
        );
        process.chdir(dir);

        const value = [
            {
                src: path.resolve(dir, 'nested/other.js'),
                dest: 'nested/other.js',
            },
            {
                src: path.resolve(dir, 'nested/inside.js'),
                dest: 'nested/inside.js',
            },
            {
                src: path.resolve(dir, 'z-file2.js'),
                dest: 'z-file2.js',
            },
            {
                src: path.resolve(dir, 'file1.js'),
                dest: 'file1.js',
            },
        ];

        const result = filesPostProcessor({ value });

        expect(result).toMatchSnapshot();
    });

    test('returns empty hash when file does not exist', () => {
        const dir = path.resolve(
            __dirname,
            '../file-manager/__sandbox__/stats1/',
        );
        process.chdir(dir);

        const value = [
            {
                src: path.resolve(dir, 'nested/missing.js'),
                dest: 'nested/other.js',
            },
            {
                src: path.resolve(dir, 'nested/inside.js'),
                dest: 'nested/missing.js',
            },
            {
                src: path.resolve(dir, 'missing.js'),
                dest: 'missing.js',
            },
            {
                src: path.resolve(dir, 'file1.js'),
                dest: 'file1.js',
            },
        ];

        const result = filesPostProcessor({ value });

        expect(result).toMatchSnapshot();
    });

    test('handles options', () => {
        const dir = path.resolve(
            __dirname,
            '../file-manager/__sandbox__/stats1/',
        );
        process.chdir(dir);

        const value = [
            {
                src: path.resolve(dir, 'file1.js'),
                dest: 'file1.js',
            },
            {
                src: path.resolve(dir, 'nested/inside.js'),
                dest: 'nested/inside.js',
                allowChanges: true,
            },
            {
                src: path.resolve(dir, 'nested/other.js'),
                dest: 'nested/other.js',
            },
            {
                src: path.resolve(dir, 'z-file2.js'),
                dest: 'z-file2.js',
            },
            {
                skip: ['file1.js'],
                allowChanges: ['z-file2.js'],
            },
        ];

        const result = filesPostProcessor({ value });

        expect(result).toMatchSnapshot();
    });

    test('handles single options', () => {
        const dir = path.resolve(
            __dirname,
            '../file-manager/__sandbox__/stats1/',
        );
        process.chdir(dir);

        const value = [
            {
                src: path.resolve(dir, 'file1.js'),
                dest: 'file1.js',
            },
            {
                src: path.resolve(dir, 'nested/inside.js'),
                dest: 'nested/inside.js',
                allowChanges: true,
            },
            {
                src: path.resolve(dir, 'nested/other.js'),
                dest: 'nested/other.js',
            },
            {
                src: path.resolve(dir, 'z-file2.js'),
                dest: 'z-file2.js',
            },
            {
                skip: 'file1.js',
                allowChanges: 'z-file2.js',
            },
        ];

        const result = filesPostProcessor({ value });

        expect(result).toMatchSnapshot();
    });

    test('handles allowChangesAll', () => {
        const dir = path.resolve(
            __dirname,
            '../file-manager/__sandbox__/stats1/',
        );
        process.chdir(dir);

        const value = [
            {
                src: path.resolve(dir, 'file1.js'),
                dest: 'file1.js',
            },
            {
                src: path.resolve(dir, 'nested/inside.js'),
                dest: 'nested/inside.js',
            },
            {
                src: path.resolve(dir, 'nested/other.js'),
                dest: 'nested/other.js',
            },
            {
                allowChanges: true,
            },
        ];

        const result = filesPostProcessor({ value });

        expect(result).toMatchSnapshot();
    });

    test('handles makeDirs', () => {
        const dir = path.resolve(
            __dirname,
            '../file-manager/__sandbox__/stats1/',
        );
        process.chdir(dir);

        const value = [
            {
                makeDirs: ['src'],
            },
            {
                makeDirs: [
                    'dist/other/nested',
                    'dist',
                    'dist/static',
                    'static',
                ],
            },
        ];

        const result = filesPostProcessor({ value });

        expect(result).toMatchSnapshot();
    });

    test('removes duplicate makeDirs', () => {
        const dir = path.resolve(
            __dirname,
            '../file-manager/__sandbox__/stats1/',
        );
        process.chdir(dir);

        const value = [{ makeDirs: ['dist', 'src'] }, { makeDirs: ['dist'] }];

        const result = filesPostProcessor({ value });

        expect(result).toMatchSnapshot();
    });

    test('removes duplicate makeDirs with exact path', () => {
        const dir = path.resolve(
            __dirname,
            '../file-manager/__sandbox__/stats1/',
        );
        process.chdir(dir);

        const value = [
            { makeDirs: ['src', 'dist'] },
            { makeDirs: [path.resolve(dir, 'src'), path.resolve(dir, 'dist')] },
        ];

        const result = filesPostProcessor({ value });

        expect(result).toMatchSnapshot();
    });

    test('makeDirs normalizes paths', () => {
        const dir = path.resolve(
            __dirname,
            '../file-manager/__sandbox__/stats1/',
        );
        process.chdir(dir);

        const value = [
            {
                makeDirs: [path.resolve('src/')],
            },
            {
                makeDirs: ['src/'],
            },
            {
                makeDirs: ['src'],
            },
        ];

        const result = filesPostProcessor({ value });

        expect(result).toMatchSnapshot();
    });

    test('skip works with makeDirs', () => {
        const dir = path.resolve(
            __dirname,
            '../file-manager/__sandbox__/stats1/',
        );
        process.chdir(dir);

        const value = [
            {
                makeDirs: ['src', 'dist', 'static'],
            },
            {
                skip: ['src/', 'dist'],
            },
        ];

        const result = filesPostProcessor({ value });

        expect(result).toMatchSnapshot();
    });

    test('makeDirs skip remove last tree when both are specified', () => {
        const dir = path.resolve(
            __dirname,
            '../file-manager/__sandbox__/stats1/',
        );
        process.chdir(dir);

        const value = [
            {
                makeDirs: ['dist', 'dist/static', 'src'],
            },
            {
                skip: ['dist/static'],
            },
        ];

        const result = filesPostProcessor({ value });

        expect(result).toMatchSnapshot();
    });

    test('makeDirs skip remove whole tree when base specified', () => {
        const dir = path.resolve(
            __dirname,
            '../file-manager/__sandbox__/stats1/',
        );
        process.chdir(dir);

        const value = [
            {
                makeDirs: ['dist', 'dist/static', 'src'],
            },
            {
                skip: ['dist'],
            },
        ];

        const result = filesPostProcessor({ value });

        expect(result).toMatchSnapshot();
    });

    test('skip files if inside skipped dir', () => {
        const dir = path.resolve(
            __dirname,
            '../file-manager/__sandbox__/stats1/',
        );
        process.chdir(dir);

        const value = [
            {
                src: path.resolve(dir, 'nested/other.js'),
                dest: 'nested/other.js',
            },
            {
                makeDirs: ['dist', 'dist/static', 'src'],
            },
            {
                skip: ['nested'],
            },
        ];

        const result = filesPostProcessor({ value });

        expect(result).toMatchSnapshot();
    });

    test('do not skip files if directory does not match', () => {
        const dir = path.resolve(
            __dirname,
            '../file-manager/__sandbox__/stats1/',
        );
        process.chdir(dir);

        const value = [
            {
                src: path.resolve(dir, 'nested/inside/other.js'),
                dest: 'nested/inside/other.js',
            },
            {
                makeDirs: ['dist', 'dist/static', 'src'],
            },
            {
                skip: ['nested/outside'],
            },
        ];

        const result = filesPostProcessor({ value });

        expect(result).toMatchSnapshot();
    });

    test('adds file paths to makeDirs', () => {
        const dir = path.resolve(
            __dirname,
            '../file-manager/__sandbox__/stats1/',
        );
        process.chdir(dir);

        const value = [
            {
                src: path.resolve(dir, 'file1.js'),
                dest: 'dist/file2.js',
            },
            {
                src: path.resolve(dir, 'file1.js'),
                dest: 'file1.js',
            },
            {
                src: path.resolve(dir, 'nested/inside/other.js'),
                dest: 'nested/inside/other.js',
            },
            {
                src: path.resolve(dir, 'nested/outside/other.js'),
                dest: 'nested/outside/other.js',
            },
            {
                makeDirs: ['dist', 'dist/static', 'src'],
            },
            {
                skip: ['nested/outside'],
            },
        ];

        const result = filesPostProcessor({ value });

        expect(result).toMatchSnapshot();
    });
});
