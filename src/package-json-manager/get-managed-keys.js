/* @flow */

import { isPlainObject, merge } from 'lodash';

import type { Lifecycles, PackageJson } from '../types.js';

const customScripts = {
    dev: 'backtrack dev --development',
    build: 'backtrack build --production',

    // 'dev.prod': 'backtrack dev --production',
    // 'build.dev': 'backtrack build --development',
};

const removeEmpty = (object) => {
    return Object.keys(object).reduce((acc, key) => {
        const value = object[key];

        if (isPlainObject(value)) {
            return {
                ...acc,
                [key]: removeEmpty(value),
            };
        }

        if (value === '' || value === null || value === undefined) {
            return acc;
        }

        return {
            ...acc,
            [key]: value,
        };
    }, {});
};

function getManagedKeys(lifecycles: Lifecycles = {}): PackageJson {
    const { packageJson = [] } = lifecycles;

    const getScripts = Object.keys(lifecycles).reduce(
        (acc, currentLifecycle) => {
            /**
             * Remove internally managed tasks
             */
            if (
                ['packageJson', 'config', 'files', 'resolve'].includes(
                    currentLifecycle,
                )
            ) {
                return acc;
            }

            const script = lifecycles[currentLifecycle];

            /**
             * Remove unused lifecycles
             */
            if (!script || (Array.isArray(script) && script.length === 0)) {
                return acc;
            }

            /**
             * call backtrack LIFECYCLE unless modified
             */
            const matched =
                // $FlowIssue
                customScripts[currentLifecycle] ||
                `backtrack ${currentLifecycle}`;

            return { ...acc, [currentLifecycle]: matched };
        },
        {},
    );

    const scripts =
        Object.keys(getScripts).length !== 0 ? { scripts: getScripts } : {};

    const mergePackageJson = merge(...packageJson);
    const filteredPackageJson = removeEmpty(mergePackageJson);
    const mergedKeys: PackageJson = merge(scripts, filteredPackageJson);

    return mergedKeys;
}

export { getManagedKeys };
