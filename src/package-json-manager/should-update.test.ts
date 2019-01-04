const shouldUpdate = (
    packageJson: any,
    managedKeys: any,
    previousManagedKeys?: any,
) =>
    require('./should-update').shouldUpdate(
        packageJson,
        managedKeys,
        previousManagedKeys,
    );

describe('shouldUpdate', () => {
    test('should not update without previous', () => {
        const packageJson = {
            scripts: { one: 'script', dev: 'backtrack dev' },
            'lint-staged': {
                '*.{js,md,json}': ['prettier --write', 'git add'],
            },
        };

        const managedKeys = {
            scripts: { dev: 'backtrack dev' },
            'lint-staged': {
                '*.{js,md,json}': ['prettier --write', 'git add'],
            },
        };

        const updatePackageJson = shouldUpdate(packageJson, managedKeys);

        expect(updatePackageJson).toEqual(false);
    });

    test('should not update with previous wrong but packageJson right', () => {
        const packageJson = {
            scripts: { one: 'script', dev: 'backtrack dev' },
            'lint-staged': {
                '*.{js,md,json}': ['prettier --write', 'git add'],
            },
        };

        const managedKeys = {
            scripts: { dev: 'backtrack dev' },
            'lint-staged': {
                '*.{js,md,json}': ['prettier --write', 'git add'],
            },
        };

        const previousManagedKeys = {
            scripts: { dev: 'backtrack dev', test: 'backtrack test' },
            'lint-staged': {
                '*.{js,md,json}': ['prettier --write', 'git add'],
            },
        };

        const updatePackageJson = shouldUpdate(
            packageJson,
            managedKeys,
            previousManagedKeys,
        );

        expect(updatePackageJson).toEqual(false);
    });

    test('should update if packageJson is wrong', () => {
        const packageJson = { scripts: { one: 'script' } };

        const managedKeys = { scripts: { dev: 'backtrack dev' } };

        const previousManagedKeys = { scripts: { dev: 'backtrack dev' } };

        const updatePackageJson = shouldUpdate(
            packageJson,
            managedKeys,
            previousManagedKeys,
        );

        expect(updatePackageJson).toEqual(true);
    });

    test('should update if packageJson is wrong - array', () => {
        const packageJson = {
            'lint-staged': {
                '*.{js,md,json}': ['git add'],
            },
        };

        const managedKeys = {
            'lint-staged': {
                '*.{js,md,json}': ['prettier --write', 'git add'],
            },
        };

        const previousManagedKeys = {
            'lint-staged': {
                '*.{js,md,json}': ['prettier --write', 'git add'],
            },
        };

        const updatePackageJson = shouldUpdate(
            packageJson,
            managedKeys,
            previousManagedKeys,
        );

        expect(updatePackageJson).toEqual(true);
    });

    test('should update if packageJson is different 1', () => {
        const packageJson = { scripts: { 'one.script': 'script' } };

        const managedKeys = { scripts: { 'one.script': 'backtrack dev' } };

        const updatePackageJson = shouldUpdate(packageJson, managedKeys);

        expect(updatePackageJson).toEqual(true);
    });

    test('should update if packageJson is different', () => {
        const packageJson = { scripts: { one: 'script' } };

        const managedKeys = { scripts: { dev: 'backtrack dev' } };

        const updatePackageJson = shouldUpdate(packageJson, managedKeys);

        expect(updatePackageJson).toEqual(true);
    });

    test('should update if previousManagedKeys is different', () => {
        const packageJson = {
            scripts: { one: 'script', test: 'backtrack test' },
        };

        const managedKeys = {
            scripts: { dev: 'backtrack dev', test: 'backtrack test' },
        };

        const previousManagedKeys = { scripts: { test: 'backtrack test' } };

        const updatePackageJson = shouldUpdate(
            packageJson,
            managedKeys,
            previousManagedKeys,
        );

        expect(updatePackageJson).toEqual(true);
    });

    test('should update if previousManagedKey is removed', () => {
        const packageJson = {
            scripts: {
                one: 'script',
                dev: 'backtrack dev',
                test: 'backtrack test',
            },
        };

        const managedKeys = { scripts: { dev: 'backtrack dev' } };

        const previousManagedKeys = {
            scripts: { dev: 'backtrack dev', test: 'backtrack test' },
        };

        const updatePackageJson = shouldUpdate(
            packageJson,
            managedKeys,
            previousManagedKeys,
        );

        expect(updatePackageJson).toEqual(true);
    });

    test('should not update if packageJson does not have key and managed is null', () => {
        const packageJson = { scripts: {} };

        const managedKeys = { scripts: { test: null } };

        const previousManagedKeys = { scripts: { test: null } };

        const updatePackageJson = shouldUpdate(
            packageJson,
            managedKeys,
            previousManagedKeys,
        );

        expect(updatePackageJson).toEqual(false);
    });
});

// Use an empty export to please Babel's single file emit.
// https://github.com/Microsoft/TypeScript/issues/15230
export {};
