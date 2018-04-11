/* @flow */

import path from 'path';

const parseFilePath = (file) =>
    require('./parse-file-path').parseFilePath(file);

describe('parseFilePath', () => {
    const cwd = process.cwd();
    let dir;

    beforeEach(() => {
        dir = path.resolve(__dirname, '__sandbox__/files1/');
        process.chdir(dir);
    });

    afterEach(() => {
        process.chdir(cwd);
    });

    test('parses absolute file', () => {
        const file = path.resolve(dir, 'test-file.js');

        const result = parseFilePath(file);

        expect(result).toMatchSnapshot();
    });

    test('parses relative file', () => {
        const file = 'test-file.js';

        const result = parseFilePath(file);

        expect(result).toMatchSnapshot();
    });

    test('parses nested relative file', () => {
        const file = 'nested/other.js';

        const result = parseFilePath(file);

        expect(result).toMatchSnapshot();
    });

    test('parses nested absolute file', () => {
        const file = path.resolve(dir, 'nested/other.js');

        const result = parseFilePath(file);

        expect(result).toMatchSnapshot();
    });

    test('parses ./ relative file', () => {
        const file = path.resolve(dir, './nested/other.js');

        const result = parseFilePath(file);

        expect(result).toMatchSnapshot();
    });

    test('returns empty string when file does not exist', () => {
        const file = path.resolve(dir, './missing-file.js');

        const result = parseFilePath(file);

        expect(result).toMatchSnapshot();
    });
});
