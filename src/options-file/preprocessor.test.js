/* @flow */

import { Preprocessor } from './preprocessor';

describe('Preprocessor', () => {
    test('removes previous lifecycles when false found', () => {
        const preprocessor = new Preprocessor();

        const config = {
            dev: ['before'],
        };

        const value = {
            dev: false,
            files: [{ allowChanges: false }],
        };

        const result = preprocessor({ value, config, dirname: __dirname });

        expect(result).toMatchSnapshot();
    });

    test('removes removes lifecycle with no config', () => {
        const preprocessor = new Preprocessor();

        const value = {
            dev: false,
            files: [{ allowChanges: false }],
        };

        const result = preprocessor({ value, dirname: __dirname });

        expect(result).toMatchSnapshot();
    });

    test('removes previous lifecycles but keeps new', () => {
        const preprocessor = new Preprocessor();

        const value = {
            dev: [false, 'eslint'],
            files: [{ allowChanges: false }],
        };

        const result = preprocessor({ value, dirname: __dirname });

        expect(result).toMatchSnapshot();
    });

    test('removes previous lifecycles with no config', () => {
        const preprocessor = new Preprocessor();

        const value = {
            dev: [false, 'eslint'],
            files: [{ allowChanges: false }],
        };

        const result = preprocessor({ value, dirname: __dirname });

        expect(result).toMatchSnapshot();
    });
});
