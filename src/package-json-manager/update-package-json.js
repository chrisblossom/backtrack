/* @flow */

import { cloneDeep, isEmpty, isPlainObject, get, merge, unset } from 'lodash';
import { getParentsFromPath, mapObjectKeyNames } from '../utils/object-utils';
import type { PackageJson } from '../types.js';

function updatePackageJson(
    packageJson: PackageJson,
    managedKeys: ?PackageJson,
    previousManagedKeys: ?PackageJson,
): PackageJson {
    /**
     * merge mutates. Deep clone to prevent mutation
     */
    const packageJsonCopy = cloneDeep(packageJson);

    /**
     * remove no longer managed keys
     */
    if (previousManagedKeys) {
        const mapPreviousManagedKeys = mapObjectKeyNames(previousManagedKeys);

        mapPreviousManagedKeys.forEach((key) => {
            const matchedMangedKey = get(managedKeys, key);

            if (matchedMangedKey === undefined) {
                const pathTree = getParentsFromPath(key);

                pathTree.forEach((currentPath, index) => {
                    /**
                     * the first path is the missing managed key
                     */
                    if (index === 0) {
                        unset(packageJsonCopy, currentPath);
                    }

                    /**
                     * Unset object empty tree
                     */
                    const matchedPackageKey = get(packageJsonCopy, currentPath);
                    if (
                        isPlainObject(matchedPackageKey) &&
                        isEmpty(matchedPackageKey)
                    ) {
                        unset(packageJsonCopy, currentPath);
                    }
                });
            }
        });
    }

    const result = merge(packageJsonCopy, managedKeys);

    return result;
}

export { updatePackageJson };
