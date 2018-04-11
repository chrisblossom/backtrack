/* @flow */

import { get, isEqual } from 'lodash';
import { mapObjectKeyNames } from '../utils/object-utils';

import type { PackageJson } from '../types.js';

function shouldUpdate(
    packageJson: PackageJson,
    managedKeys: ?PackageJson,
    previousManagedKeys: ?PackageJson,
): boolean {
    const mapManagedKeys = mapObjectKeyNames(managedKeys);

    /**
     * update if managedKeys and packageJson do not match
     */
    const hasUpdatedKeys = mapManagedKeys.some((key) => {
        const matchedMangedKey = get(managedKeys, key);
        const matchedPackageJson = get(packageJson, key);

        return isEqual(matchedPackageJson, matchedMangedKey) === false;
    });

    if (hasUpdatedKeys === true) {
        return true;
    }

    if (previousManagedKeys) {
        /**
         * update if any keys any keys are missing from previousManagedKeys
         */
        const mapPreviousManagedKeys = mapObjectKeyNames(previousManagedKeys);
        const hasRemovedKeys = mapPreviousManagedKeys.some((key) => {
            const matchedMangedKey = get(managedKeys, key);
            const matchedPackageJson = get(packageJson, key);

            return (
                matchedMangedKey === undefined &&
                matchedPackageJson !== undefined
            );
        });

        if (hasRemovedKeys === true) {
            return true;
        }
    }

    return false;
}

export { shouldUpdate };
