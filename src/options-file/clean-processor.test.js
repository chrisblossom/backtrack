/* @flow */

import path from 'path';
import { buildPath } from '../config/paths';

const cleanProcessor = (args) =>
    require('./clean-processor').cleanProcessor(args);

describe('cleanProcessor', () => {
    test('merges args together and completes resolves path', () => {
        const current = {
            del: ['first', 'second'],
            makeDirs: [
                path.resolve(buildPath, 'first'),
                path.resolve(buildPath, 'second'),
            ],
        };

        const value = [
            {
                del: ['third'],
                makeDirs: ['third'],
            },
        ];

        const result = cleanProcessor({ current, value });

        expect(result).toMatchSnapshot();
    });

    test('removes duplicates', () => {
        const value = [
            {
                del: ['first'],
                makeDirs: ['first'],
            },
            {
                del: ['first'],
                makeDirs: ['first'],
            },
        ];

        const result = cleanProcessor({ value });

        expect(result).toMatchSnapshot();
    });
});
