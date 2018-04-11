/* @flow */

import { getManagedKeys } from './get-managed-keys';
import { shouldUpdate } from './should-update';
import { updatePackageJson } from './update-package-json';
import { backupPackageJson } from './backup-package-json';
import { loadPackageJson } from './load-package-json';
import { sortPackageJson } from './sort-package-json';
import { writePackageJson } from './write-package-json';

import type { Lifecycles, PackageJson } from '../types.js';

async function packageJsonManager(
    lifecycles?: Lifecycles = {},
    previousManagedKeys: ?PackageJson,
): Promise<PackageJson> {
    /**
     * Get managed keys
     */
    const managedKeys = getManagedKeys(lifecycles);

    /**
     * load current package.json from file
     */
    const packageJson = loadPackageJson();

    /**
     * Check if update is needed
     */
    const packageJsonIsOutdated = shouldUpdate(
        packageJson,
        managedKeys,
        previousManagedKeys,
    );
    if (packageJsonIsOutdated === false) {
        return managedKeys;
    }

    /**
     * Check if package.json needs to be backed up
     */
    await backupPackageJson(packageJson, managedKeys, previousManagedKeys);

    /**
     * Merge managed keys with current packageJson
     */
    const updatedPackageJson = updatePackageJson(
        packageJson,
        managedKeys,
        previousManagedKeys,
    );

    /**
     * sort package json
     */
    const packageJsonSorted = sortPackageJson(updatedPackageJson);

    /**
     * write packageJson
     */
    writePackageJson(packageJsonSorted);

    return managedKeys;
}

export { packageJsonManager };
