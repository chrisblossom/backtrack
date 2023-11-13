import { Lifecycles, PackageJson } from '../types';
import { getManagedKeys } from './get-managed-keys';
import { shouldUpdate } from './should-update';
import { updatePackageJson } from './update-package-json';
import { backupPackageJson } from './backup-package-json';
import { loadPackageJson } from './load-package-json';
import { removeNullValues } from './remove-null-values';
import { sortPackageJson } from './sort-package-json';
import { writePackageJson } from './write-package-json';

async function packageJsonManager(
	// eslint-disable-next-line default-param-last
	lifecycles: Lifecycles = {},
	previousManagedKeys?: PackageJson,
): Promise<PackageJson> {
	/**
	 * Get managed keys
	 */
	const managedKeys = getManagedKeys(lifecycles);

	/**
	 * load current package.json from file
	 */
	const packageJson = await loadPackageJson();

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
	 * remove null values
	 */
	const packageJsonFiltered = removeNullValues(updatedPackageJson);

	/**
	 * sort package json
	 */
	const packageJsonSorted = sortPackageJson(packageJsonFiltered);

	/**
	 * write packageJson
	 */
	await writePackageJson(packageJsonSorted);

	return managedKeys;
}

export { packageJsonManager };
