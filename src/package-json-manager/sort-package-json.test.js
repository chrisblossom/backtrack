/* @flow */

require('./sort-package-json');

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
            engines: {
                node: '>=6.9.0',
                npm: '>=3.10.10',
                yarn: '>=1.6.0',
            },
            devEngines: {
                node: '>=8.9.0',
                npm: '>=5.5.1',
            },
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
            'engines',
            'devEngines',
            'scripts',
            'after',
            'other',
            'devDependencies',
            'dependencies',
        ]);
    });
});
