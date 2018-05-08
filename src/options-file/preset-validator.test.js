/* @flow */

import { presetValidator } from './preset-validator';

describe('presetValidator', () => {
    test('handles undefined', () => {
        const validated = presetValidator();

        expect(validated).toEqual(undefined);
    });

    test('preset passes', () => {
        const value = require('./__sandbox__/preset-01');

        const validated = presetValidator({ value });

        expect(validated).toEqual(undefined);
    });

    test('preset validates custom lifecycles', () => {
        const value = {
            invalid1: new Date('2017-12-05T18:02:11.869Z'),
        };

        try {
            expect.hasAssertions();
            // $FlowIgnore
            presetValidator({ value });
        } catch (error) {
            expect(error).toMatchSnapshot();
        }
    });

    test('preset allows no valid options', () => {
        const value = {};

        const validated = presetValidator({ value });
        expect(validated).toEqual(undefined);
    });

    test('allows empty presets', () => {
        const value = {
            dev: [],
            clean: [],
            build: [],
            lint: [],
            test: [],
            files: [],
            format: [],
            packageJson: [],
            config: [],
        };

        const validated = presetValidator({ value });
        expect(validated).toEqual(undefined);
    });

    test('fails with unknown key', () => {
        const value = {
            clean: [
                {
                    del: ['*'],
                    makeDirs: ['dir'],
                    excess: 'something',
                },
            ],
        };

        try {
            expect.hasAssertions();
            // $FlowIgnore
            presetValidator({ value });
        } catch (error) {
            expect(error).toMatchSnapshot();
        }
    });

    test('fails no options - makeDirs', () => {
        const value = {
            clean: [
                {
                    makeDirs: [''],
                },
            ],
        };

        try {
            expect.hasAssertions();
            presetValidator({ value });
        } catch (error) {
            expect(error).toMatchSnapshot();
        }
    });

    test('fails no options - del', () => {
        const value = {
            clean: [
                {
                    del: [''],
                },
            ],
        };

        try {
            expect.hasAssertions();
            presetValidator({ value });
        } catch (error) {
            expect(error).toMatchSnapshot();
        }
    });

    test('success on clean', () => {
        const value = {
            clean: [
                {
                    copy: {
                        src: 'static',
                        dest: 'static',
                    },
                },
                {
                    del: ['**'],
                    makeDirs: ['fake/dir'],
                },
            ],
        };

        const validated = presetValidator({ value });

        expect(validated).toEqual(undefined);
    });

    test('success with files options', () => {
        const value = {
            files: [
                {
                    src: 'file1.js',
                    dest: 'file1.js',
                },
                {
                    src: 'nested/inside.js',
                    dest: 'nested/inside.js',
                    allowChanges: true,
                },
                {
                    src: 'nested/other.js',
                    dest: 'nested/other.js',
                },
                {
                    skip: ['file1.js'],
                    allowChanges: ['file1.js'],
                    makeDirs: ['dist'],
                },
                {
                    skip: ['file1.js'],
                },
                {
                    makeDirs: ['dist'],
                },
                {
                    allowChanges: true,
                },
            ],
        };

        const validated = presetValidator({ value });
        expect(validated).toEqual(undefined);
    });

    test('success with resolve', () => {
        const value = {
            resolve: {
                'some-npm-pkg': '/path/to/pkg',
            },
        };

        // $FlowIgnore
        const validated = presetValidator({ value });
        expect(validated).toEqual(undefined);
    });
});
