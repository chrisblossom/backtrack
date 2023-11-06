import { cloneDeep, isEmpty, isPlainObject, get, merge, unset } from 'lodash';
import { getParentsFromPath, mapObjectKeyNames } from '../utils/object-utils';
import { PackageJson } from '../types';

function updatePackageJson(
	packageJson: PackageJson,
	managedKeys?: PackageJson,
	previousManagedKeys?: PackageJson,
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
			const pathTree = getParentsFromPath(key);

			pathTree.forEach((currentPath: string[], index: number) => {
				/**
				 * the first path is the missing managed key
				 */
				if (index === 0) {
					unset(packageJsonCopy, currentPath);
				}

				/**
				 * Unset object empty tree
				 */
				const matchedPackageKey: unknown = get(
					packageJsonCopy,
					currentPath,
				);

				if (
					isPlainObject(matchedPackageKey) &&
					isEmpty(matchedPackageKey)
				) {
					unset(packageJsonCopy, currentPath);
				}
			});
		});
	}

	const result = merge(packageJsonCopy, managedKeys);

	return result;
}

export { updatePackageJson };
