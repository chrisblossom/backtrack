/* @flow */

import sortKeys from 'sort-keys';

import type { PackageJson } from '../types.js';

/**
 * Thanks to
 * https://github.com/keithamus/sort-package-json
 * https://github.com/camacho/format-package
 */

function sortPackageJson(packageJson: PackageJson): PackageJson {
    /**
     * sort initially to sort deep keys
     */
    const initialSort = sortKeys(packageJson, { deep: true });

    const getSortedKeys = (keys) => {
        return keys.reduce((acc, key) => {
            const value = initialSort[key];

            if (value === undefined) {
                return acc;
            }

            return { ...acc, [key]: value };
        }, {});
    };

    const top = [
        'name',
        'version',
        'description',
        'keywords',
        'license',
        'private',
        'preferGlobal',
        'publishConfig',

        'repository',
        'bugs',
        'homepage',

        'author',
        'contributors',

        'engines',
        'engineStrict',
        'os',
        'cpu',

        'directories',
        'files',
        'bin',
        'main',
        'module',
        'jsnext:main',

        'browser',
        'config',

        'types',
        'typings',
        'style',

        'scripts',

        'pre-commit',
        'lint-staged',

        'babel',
        'eslintConfig',
        'stylelint',
        'browserslist',
    ];

    const bottom = [
        'bundledDependencies',
        'bundleDependencies',
        'optionalDependencies',
        'peerDependencies',
        'devDependencies',
        'dependencies',
    ];

    const topKeys = getSortedKeys(top);
    const bottomKeys = getSortedKeys(bottom);

    /**
     * Get keys not explicitly sorted
     */
    const mergedTopBottom = [...top, ...bottom];
    const rest = Object.keys(initialSort).reduce((acc, key) => {
        if (mergedTopBottom.includes(key)) {
            return acc;
        }

        const value = initialSort[key];

        return { ...acc, [key]: value };
    }, {});

    const result = {
        ...topKeys,
        ...rest,
        ...bottomKeys,
    };

    return result;
}

export { sortPackageJson };
