/* @flow */

const sortPackageJson = (packageJson) =>
    require('./sort-package-json').sortPackageJson(packageJson);

describe('sortPackageJson', () => {
    test('sorts packageJson', () => {
        const packageJson = {
            other: 'other',
            after: 'one',
            repository: 'repo',
            bugs: 'all',
            name: 'package',
            scripts: {
                one: 'script',
            },
            dependencies: {
                underscore: '1',
                lodash: '4',
            },
            devDependencies: {},
        };

        const sorted = sortPackageJson(packageJson);

        expect(Object.keys(sorted)).toEqual([
            'name',
            'repository',
            'bugs',
            'scripts',
            'after',
            'other',
            'devDependencies',
            'dependencies',
        ]);
    });
});
