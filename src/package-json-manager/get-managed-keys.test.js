/* @flow */

const getManagedKeys = (lifecycles) =>
    require('./get-managed-keys').getManagedKeys(lifecycles);

describe('getManagedKeys', () => {
    test('handles undefined', () => {
        const result = getManagedKeys();

        expect(result).toEqual({});
    });

    test('handles empty lifecycles', () => {
        const result = getManagedKeys({});

        expect(result).toEqual({});
    });

    test('filters empty presets and removes non-scripts', () => {
        const lifecycles = {
            dev: ['dev'],
            build: ['build'],
            test: ['test'],
            packageJson: [{}],
            config: [{}],
            resolve: {},
        };

        const result = getManagedKeys(lifecycles);

        expect(result).toEqual({
            scripts: {
                dev: 'backtrack dev --development',
                build: 'backtrack build --production',
                test: 'backtrack test',
            },
        });
    });

    test('adds custom packageJson', () => {
        const lifecycles = {
            dev: ['dev'],
            build: ['build'],
            packageJson: [
                {
                    scripts: {
                        start: 'run',
                    },
                    'lint-staged': {
                        '*.js': ['eslint'],
                    },
                },
            ],
        };

        const result = getManagedKeys(lifecycles);

        expect(result).toEqual({
            scripts: {
                dev: 'backtrack dev --development',
                build: 'backtrack build --production',
                start: 'run',
            },
            'lint-staged': {
                '*.js': ['eslint'],
            },
        });
    });

    test('merges multiple packageJson together', () => {
        const lifecycles = {
            packageJson: [
                {
                    scripts: {
                        'lint.fix': 'eslint --fix',
                    },
                },
                {
                    scripts: {
                        'format.fix': 'prettier',
                    },
                },
            ],
        };

        const result = getManagedKeys(lifecycles);

        expect(result).toEqual({
            scripts: {
                'lint.fix': 'eslint --fix',
                'format.fix': 'prettier',
            },
        });
    });

    test('removes empty strings / null', () => {
        const lifecycles = {
            packageJson: [
                {
                    other: 'yes',
                    scripts: {
                        'lint.fix': 'eslint --fix',
                        'format.fix': 'prettier',
                    },
                },
                {
                    other: null,
                    scripts: {
                        'lint.fix': '',
                    },
                },
            ],
        };

        const result = getManagedKeys(lifecycles);

        expect(result).toEqual({
            scripts: {
                'format.fix': 'prettier',
            },
        });
    });
});
