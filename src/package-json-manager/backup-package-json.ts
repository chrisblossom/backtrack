import path from 'path';
import { get, isEqual } from 'lodash';
import { backupFile } from '../utils/backup-file';
import { rootPath } from '../config/paths';
import log from '../utils/log';
import { mapObjectKeyNames } from '../utils/object-utils';
import { PackageJson } from '../types';

type Return = Promise<{
	file: string;
	filename: string;
} | void>;

const npmDefaults = {
	version: '1.0.0',
	description: '',
	main: 'index.js',
	scripts: {
		test: 'echo "Error: no test specified" && exit 1',
	},
	keywords: [],
	author: '',
	license: 'ISC',
};

async function backupPackageJson(
	packageJson: PackageJson,
	managedKeys?: PackageJson,
	previousManagedKeys?: PackageJson,
): Return {
	const mapManagedKeys = mapObjectKeyNames(managedKeys);
	/**
	 * backup package.json if any custom managed scripts exist
	 */

	const shouldBackup = mapManagedKeys
		.filter((key) => {
			const matchedMangedKey = get(managedKeys, key);
			const matchedPackageJson = get(packageJson, key);
			const matchedPreviousManagedKey = get(previousManagedKeys, key);
			const matchedDefaultKey = get(npmDefaults, key);

			/**
			 * Don't backup if package.json key === npm default
			 */
			if (
				matchedPreviousManagedKey === undefined &&
				isEqual(matchedPackageJson, matchedDefaultKey)
			) {
				return false;
			}

			// use isEqual to match arrays
			const result =
				matchedPackageJson &&
				isEqual(matchedMangedKey, matchedPackageJson) === false &&
				isEqual(matchedPreviousManagedKey, matchedPackageJson) ===
					false;

			return result;
		})
		.map((backupKeys) => {
			return backupKeys.join('.');
		});

	if (shouldBackup.length === 0) {
		return undefined;
	}

	const packageJsonFile = path.resolve(rootPath, 'package.json');
	const backupData = await backupFile(packageJsonFile);

	if (!backupData) {
		return undefined;
	}

	const relativeBackupFilePath = path.relative(rootPath, backupData.file);

	log.warn(
		`Unknown package.json keys: "${shouldBackup.join(
			', ',
		)}". Backing up to: ${relativeBackupFilePath}`,
	);

	return {
		file: backupData.file,
		filename: backupData.filename,
	};
}

export { backupPackageJson };
