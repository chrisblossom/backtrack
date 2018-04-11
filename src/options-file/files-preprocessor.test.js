/* @flow */

import path from 'path';

const filesPreprocessor = (args) =>
    require('./files-preprocessor').filesPreprocessor(args);

describe('filesPreprocessor', () => {
    const cwd = process.cwd();

    afterEach(() => {
        process.chdir(cwd);
    });

    test('resolves src file', () => {
        const dir = path.resolve(
            __dirname,
            '../file-manager/__sandbox__/stats1/',
        );
        process.chdir(dir);

        const value = [
            {
                src: 'file1.js',
                dest: 'one.js',
            },
            {
                src: path.resolve(dir, 'file2.js'),
                dest: 'two.js',
            },
            {
                src: 'random.js',
                dest: 'three.js',
                allowChanges: true,
            },
            {
                allowChanges: true,
            },
            {
                makeDirs: ['static'],
            },
        ];

        const result = filesPreprocessor({ value, dirname: dir });

        expect(result).toMatchSnapshot();
    });
});
