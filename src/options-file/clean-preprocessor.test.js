/* @flow */

const cleanPreprocessor = (args) =>
    require('./clean-preprocessor').cleanPreprocessor(args);

describe('cleanPreprocessor', () => {
    test('handles undefined', () => {
        const result = cleanPreprocessor();

        expect(result).toEqual([]);
    });

    test('converts all values to arrays and adds missing keys', () => {
        const value = [
            {
                del: '*',
            },
            {
                makeDirs: 'test',
            },
            {},
            {
                del: '*',
                makeDirs: 'test',
            },
        ];

        const result = cleanPreprocessor({ value });

        expect(result).toMatchSnapshot();
    });
});
