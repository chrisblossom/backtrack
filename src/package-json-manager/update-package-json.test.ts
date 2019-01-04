const updatePackageJson = (
    packageJson: any,
    managedKeys: any,
    previousManagedKeys?: any,
) =>
    require('./update-package-json').updatePackageJson(
        packageJson,
        managedKeys,
        previousManagedKeys,
    );

describe('updatePackageJson', () => {
    test('merges keys', () => {
        const packageJson = {
            name: 'package',
            scripts: {
                one: 'script',
            },
            dependencies: {
                lodash: '4',
            },
            devDependencies: {},
            peerDependencies: {},
            optionalDependencies: {},
        };

        const managedKeys = {
            scripts: {
                dev: 'backtrack dev',
                test: 'jest',
            },
            dependencies: {
                underscore: '4',
            },
        };

        const result = updatePackageJson(packageJson, managedKeys);

        expect(result).toMatchSnapshot();
    });

    test('removes keys no longer managed', () => {
        const packageJson = {
            scripts: { one: 'script', dev: 'backtrack dev' },
        };

        const managedKeys = { scripts: { dev: 'backtrack dev' } };

        const previouslyManagedKeys = {
            scripts: { one: 'script', dev: 'backtrack dev' },
        };

        const result = updatePackageJson(
            packageJson,
            managedKeys,
            previouslyManagedKeys,
        );

        expect(result).toEqual({ scripts: { dev: 'backtrack dev' } });
    });

    test('removes keys nested root no longer managed', () => {
        const packageJson = {
            name: 'backtrack',
            testing: {
                nested: 'one',
            },
        };

        const managedKeys = {};

        const previouslyManagedKeys = {
            testing: {
                nested: 'one',
            },
        };

        const result = updatePackageJson(
            packageJson,
            managedKeys,
            previouslyManagedKeys,
        );

        expect(result).toEqual({ name: 'backtrack' });
    });

    test('removes item from array when item removed', () => {
        const packageJson = {
            name: 'backtrack',
            files: ['one', 'two'],
        };

        const managedKeys = {
            files: ['one'],
        };

        const previouslyManagedKeys = {
            files: ['one', 'two'],
        };

        const result = updatePackageJson(
            packageJson,
            managedKeys,
            previouslyManagedKeys,
        );

        expect(result).toEqual({ name: 'backtrack', files: ['one'] });
    });

    test('removes keys with .', () => {
        const packageJson = {
            name: 'backtrack',
            scripts: {
                'lint.fix': 'one',
                nested: {
                    'test.ed': {
                        remove: 'this',
                    },
                },
            },
            're.move': 'this',
        };

        const managedKeys = {};

        const previouslyManagedKeys = {
            scripts: {
                'lint.fix': 'one',
                nested: {
                    'test.ed': {
                        remove: 'this',
                    },
                },
            },
            're.move': 'this',
        };

        const result = updatePackageJson(
            packageJson,
            managedKeys,
            previouslyManagedKeys,
        );

        expect(result).toEqual({ name: 'backtrack' });
    });

    test('removes all empty even deeper but stops when not empty', () => {
        const packageJson = {
            random: 'key',
            testing: {
                nested: {
                    other_random: 'key',
                    nested2: {
                        nested3: 'all',
                    },
                },
            },
        };

        const managedKeys = {
            other: 'hello',
        };

        const previouslyManagedKeys = {
            testing: {
                nested: {
                    nested2: {
                        nested3: 'all',
                    },
                },
            },
        };

        const result = updatePackageJson(
            packageJson,
            managedKeys,
            previouslyManagedKeys,
        );

        expect(result).toEqual({
            random: 'key',
            other: 'hello',
            testing: {
                nested: {
                    other_random: 'key',
                },
            },
        });
    });

    test('works if already removed', () => {
        const packageJson = { scripts: { dev: 'backtrack dev' } };
        const managedKeys = { scripts: { dev: 'backtrack dev' } };
        const previouslyManagedKeys = {
            scripts: { one: 'script', dev: 'backtrack dev' },
        };

        const result = updatePackageJson(
            packageJson,
            managedKeys,
            previouslyManagedKeys,
        );

        expect(result).toEqual({ scripts: { dev: 'backtrack dev' } });
    });
});

// Use an empty export to please Babel's single file emit.
// https://github.com/Microsoft/TypeScript/issues/15230
export {};
