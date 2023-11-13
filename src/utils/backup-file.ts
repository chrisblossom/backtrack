import path from 'path';
import { move, pathExists } from 'fs-extra';
import { rootPath } from '../config/paths';
import { getFileHash } from './get-file-hash';

type Return = Promise<
	| {
			file: string;
			filename: string;
	  }
	| undefined
>;

async function backupFile(file: string): Return {
	const hash = await getFileHash(file);

	const { base: filename, dir, ext = '' } = path.parse(file);

	const shortHash = hash.slice(0, 8);

	let backupFilename = `${filename}-backup-${shortHash}${ext}`;
	let backupFilePath = path.resolve(dir, backupFilename);

	/**
	 * Handle the same file being backed up multiple times
	 */
	let previouslyBackedUp = false;
	let backupFileExists = await pathExists(backupFilePath);
	if (backupFileExists) {
		let count = 0;
		const maxCount = 10;
		while (
			backupFileExists &&
			previouslyBackedUp === false &&
			count < maxCount
		) {
			const backupFileHash = await getFileHash(backupFilePath);

			/**
			 * Check if the existing file has the same hash.
			 *
			 * Prevents backing up the same file over
			 */
			if (backupFileHash === hash) {
				previouslyBackedUp = true;
			}

			backupFilename = `${filename}-backup-${shortHash}-${count.toString()}${ext}`;
			backupFilePath = path.resolve(dir, backupFilename);

			backupFileExists = await pathExists(backupFilePath);
			count += 1;
		}

		/**
		 * Prevent flooding filesystem with backups
		 */
		if (count === maxCount && backupFileExists) {
			const relativeFile = path.relative(rootPath, file);

			throw new Error(`Remove all existing backups of: ${relativeFile}`);
		}
	}

	/**
	 * Don't backup anything if the file has already been backed up
	 */
	if (previouslyBackedUp === false) {
		/**
		 * Will fail if backup file already exists
		 */
		await move(file, backupFilePath, {
			overwrite: false,
		});

		return {
			file: backupFilePath,
			filename: backupFilename,
		};
	}

	return undefined;
}

export { backupFile };
