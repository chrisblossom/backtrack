/* @flow */

import path from 'path';

const backupPackageJson = (packageJson, managedKeys, previousManagedKeys) =>
    require('./backup-package-json').backupPackageJson(
        packageJson,
        managedKeys,
        previousManagedKeys,
    );

describe('backupPackageJson', () => {
    const cwd = process.cwd();
    let move;

    beforeEach(() => {
        jest.spyOn(console, 'info').mockImplementation(() => undefined);
        jest.spyOn(console, 'warn').mockImplementation(() => undefined);
        jest.spyOn(console, 'error').mockImplementation(() => undefined);
        jest.spyOn(console, 'debug').mockImplementation(() => undefined);

        // $FlowIssue
        move = require.requireMock('fs-extra').move;

        jest.mock('fs-extra', () => ({
            move: jest.fn(() => Promise.resolve()),
        }));

        /**
         * Change dir to keep consistent package.json hash for filename
         */
        const dir = path.resolve(__dirname, '__sandbox__/package-json-1/');
        process.chdir(dir);
    });

    afterEach(() => {
        process.chdir(cwd);
    });

    test('backup package.json when a managed script already exists', async () => {
        const packageJson = {
            name: 'testing',
            scripts: {
                start: 'start',
                test: 'jest',
            },
        };

        const managedKeys = {
            scripts: {
                test: 'backtrack test',
                lint: 'backtrack lint',
            },
        };

        const previousManagedKeys = {
            scripts: {
                test: 'backtrack test',
            },
        };

        const backupResult = await backupPackageJson(
            packageJson,
            managedKeys,
            previousManagedKeys,
        );

        expect(move.mock.calls).toMatchSnapshot();
        expect(backupResult).toMatchSnapshot();
    });

    test('backup package.json when multiple keys already exist', async () => {
        const packageJson = {
            name: 'testing',
            main: 'fake-entry.js',
            scripts: {
                start: 'start',
                test: 'jest',
            },
        };

        const managedKeys = {
            main: 'real-entry.js',
            scripts: {
                test: 'backtrack test',
                lint: 'backtrack lint',
            },
        };

        const previousManagedKeys = {
            scripts: {
                test: 'backtrack test',
            },
        };

        const backupResult = await backupPackageJson(
            packageJson,
            managedKeys,
            previousManagedKeys,
        );

        expect(move.mock.calls).toMatchSnapshot();
        expect(backupResult).toMatchSnapshot();
    });

    test('does not backup if script does not exist yet', async () => {
        const packageJson = {
            name: 'testing',
            scripts: {
                start: 'start',
            },
        };

        const managedKeys = {
            scripts: {
                test: 'backtrack test',
                lint: 'backtrack lint',
            },
        };

        const previousManagedKeys = {
            scripts: {
                test: 'backtrack test',
            },
        };

        const backupResult = await backupPackageJson(
            packageJson,
            managedKeys,
            previousManagedKeys,
        );

        expect(move.mock.calls).toEqual([]);
        expect(backupResult).toEqual(undefined);
    });

    test('does not backup if script equals previousManaged', async () => {
        const packageJson = {
            name: 'testing',
            scripts: {
                start: 'start',
                lint: 'previous',
            },
        };

        const managedKeys = {
            scripts: {
                test: 'backtrack test',
                lint: 'backtrack lint',
            },
        };

        const previousManagedKeys = {
            scripts: {
                test: 'backtrack test',
                lint: 'previous',
            },
        };

        const backupResult = await backupPackageJson(
            packageJson,
            managedKeys,
            previousManagedKeys,
        );

        expect(move.mock.calls).toEqual([]);
        expect(backupResult).toEqual(undefined);
    });

    test('works with array value - no backup', async () => {
        const packageJson = {
            name: 'testing',
            'lint-staged': {
                '*.{js,md,json}': ['prettier --write', 'git add'],
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

        const backupResult = await backupPackageJson(
            packageJson,
            managedKeys,
            previousManagedKeys,
        );

        expect(move.mock.calls).toEqual([]);
        expect(backupResult).toEqual(undefined);
    });

    test('works with array value - backup', async () => {
        const packageJson = {
            name: 'testing',
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

        const backupResult = await backupPackageJson(
            packageJson,
            managedKeys,
            previousManagedKeys,
        );

        expect(move.mock.calls).toMatchSnapshot();
        expect(backupResult).toMatchSnapshot();
    });

    test('handles npm default scripts', async () => {
        const packageJson = {
            name: 'testing',
            keywords: [],
            scripts: {
                start: 'start',
                test: 'echo "Error: no test specified" && exit 1',
            },
        };

        const managedKeys = {
            scripts: {
                test: 'backtrack test',
                lint: 'backtrack lint',
            },
            keywords: ['keyword'],
        };

        const backupResult = await backupPackageJson(packageJson, managedKeys);

        expect(move.mock.calls).toEqual([]);
        expect(backupResult).toEqual(undefined);
    });

    test('handles npm default test script with previously managed', async () => {
        const packageJson = {
            name: 'testing',
            scripts: {
                start: 'start',
                test: 'echo "Error: no test specified" && exit 1',
            },
        };

        const managedKeys = {
            scripts: {
                test: 'backtrack test',
                lint: 'backtrack lint',
            },
        };

        const previousManagedKeys = {
            scripts: {
                test: 'backtrack test',
                lint: 'backtrack lint',
            },
        };

        const backupResult = await backupPackageJson(
            packageJson,
            managedKeys,
            previousManagedKeys,
        );

        expect(move.mock.calls).toMatchSnapshot();
        expect(backupResult).toMatchSnapshot();
    });
});
