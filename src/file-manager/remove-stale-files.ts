import path from 'path';
import del from 'del';
import { pathExists } from 'fs-extra';
import { rootPath } from '../config/paths';
import log from '../utils/log';
import { getFileHash } from '../utils/get-file-hash';
import { backupFile } from '../utils/backup-file';
import { ParsedFiles, FileStats } from '../types';

async function backupChangedFile(removeFilePath: string): Promise<void> {
	const backupResult = await backupFile(removeFilePath);
	if (backupResult === undefined) {
		return;
	}

	const relativeBackupFilePath = path.relative(rootPath, backupResult.file);

	const relativeFilePath = path.relative(rootPath, removeFilePath);

	log.warn(
		`'${relativeFilePath}' has been modified and is no longer managed. Moving to '${relativeBackupFilePath}'`,
	);
}

async function removeStaleFiles(
	files: ParsedFiles,
	previousStats: FileStats = {},
): Promise<void> {
	const pending: Promise<unknown>[] = [];

	for (const relativeFile of Object.keys(previousStats)) {
		const previousFileHash = previousStats[relativeFile];

		/**
		 * Do nothing if dest file is still managed
		 */
		if (files.dest.files.includes(relativeFile) === false) {
			/**
			 * Any file in previousStats not found in files should be removed
			 */
			const removeFilePath = path.resolve(rootPath, relativeFile);

			/**
			 * Do nothing if file already has been removed
			 */

			const exists = await pathExists(removeFilePath);
			if (exists === true) {
				const removeFileHash = await getFileHash(removeFilePath);

				/**
				 * Remove file if file has not changed
				 */
				if (previousFileHash === removeFileHash) {
					log.info(`Removing file: ${relativeFile}`);

					const removeFile = del(removeFilePath);
					pending.push(removeFile);
				} else {
					/**
					 * Backup file if changed
					 */
					const backupFilePending = backupChangedFile(removeFilePath);

					pending.push(backupFilePending);
				}
			}
		}

		/**
		 * Handle -latest files for allowChanges
		 */
		const { base: filename, dir, ext = '' } = path.parse(relativeFile);
		const latestFilename = `${filename}-latest${ext}`;
		const latestFilePath = path.resolve(rootPath, dir, latestFilename);

		const latestFileExists = await pathExists(latestFilePath);

		const destFileIndex = files.dest.files.indexOf(relativeFile);
		const srcFile = files.src.files[destFileIndex];
		const srcHash = files.src.hash[srcFile];
		const destHash = files.dest.hash[relativeFile];

		/**
		 * Remove -latest file if dest file is equal to source
		 */
		if (latestFileExists && srcHash === destHash) {
			const relativeLatestFile = path.relative(dir, latestFilename);
			log.info(`Removing file: ${relativeLatestFile}`);

			const removeFile = del(latestFilePath);
			pending.push(removeFile);
		}
	}

	await Promise.all(pending);
}

export { removeStaleFiles };
