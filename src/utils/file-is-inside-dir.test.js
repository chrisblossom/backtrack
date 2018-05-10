/* @flow */

import path from 'path';

const fileIsInsideDir = (file, dir) =>
    require('./file-is-inside-dir').fileIsInsideDir(file, dir);

describe('fileIsInsideDir', () => {
    const cwd = process.cwd();
    const sandboxDir = path.resolve(__dirname, '__sandbox__/');

    beforeEach(() => {
        process.chdir(sandboxDir);
    });

    afterEach(() => {
        process.chdir(cwd);
    });

    test('defaults dir to rootPath', () => {
        const file = path.resolve(sandboxDir, 'nested/file.js');
        const result = fileIsInsideDir(file);

        expect(result).toEqual(true);
    });

    test('handles empty file - false', () => {
        const file = '';
        const result = fileIsInsideDir(file);

        expect(result).toEqual(false);
    });

    test('handles relative', () => {
        const file = '../';
        const result = fileIsInsideDir(file);

        expect(result).toEqual(false);
    });

    test('handles absolute', () => {
        const file = path.resolve(__dirname, '../');
        const result = fileIsInsideDir(file);

        expect(result).toEqual(false);
    });

    test('handles explicit dir - true', () => {
        const file = path.resolve(sandboxDir, 'files1/nested/other1.js');
        const dir = path.resolve(sandboxDir, 'files1/');
        const result = fileIsInsideDir(file, dir);

        expect(result).toEqual(true);
    });

    test('handles explicit dir - false', () => {
        const file = path.resolve(sandboxDir, 'files1/nested/other1.js');
        const dir = path.resolve(sandboxDir, 'other_files/');
        const result = fileIsInsideDir(file, dir);

        expect(result).toEqual(false);
    });

    test('handles explicit relative dir - true', () => {
        const file = 'files1/nested/other1.js';
        const dir = 'files1/';
        const result = fileIsInsideDir(file, dir);

        expect(result).toEqual(true);
    });

    test('handles explicit relative dir - false', () => {
        const file = 'nested/other1.js';
        const dir = 'files1/';
        const result = fileIsInsideDir(file, dir);

        expect(result).toEqual(false);
    });

    test('handles excess path with same base', () => {
        const file = path.resolve(sandboxDir, 'files1nested/other1.js');
        const dir = path.resolve(sandboxDir, 'files1');
        const result = fileIsInsideDir(file, dir);

        expect(result).toEqual(false);
    });
});
