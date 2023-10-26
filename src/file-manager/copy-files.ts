import path from 'path';
import { copy } from '../utils/copy';
import log from '../utils/log';
import { rootPath } from '../config/paths';
import { ParsedFiles, FileStats } from '../types';

async function copyFiles(files: ParsedFiles, previousStats: FileStats = {}) {
	const src = files.src;
	const dest = files.dest;

	const filesToCopy = src.files.reduce(
		(acc: { src: string; dest: string }[], srcFile, index) => {
			const destFile = dest.files[index];

			const srcHash = src.hash[srcFile];
			const destHash = dest.hash[destFile];

			/**
			 * Only copy files that have changed / do not exist
			 *
			 * hash === '' means file does not exist
			 */
			if (srcHash !== destHash) {
				const srcAbsolute = src.absolute[srcFile];

				if (destHash) {
					const previousHash = previousStats[destFile];
					/**
					 * Do not copy if ignoreUpdates is true and file already exists
					 */
					const ignoreUpdates = dest.ignoreUpdates[destFile];
					if (ignoreUpdates === true) {
						if (previousHash !== srcHash) {
							log.info(
								`Unmanaged file ${destFile} source changed. Updating .backtrack-stats.json`,
							);
						}

						return acc;
					}
					/**
					 * Do not copy if changes are allowed and destFile has been modified
					 */
					const allowChanges = dest.allowChanges[destFile];
					if (allowChanges === true && destHash !== previousHash) {
						const destAbsolute = dest.absolute[destFile];
						const {
							base: filename,
							dir,
							ext = '',
						} = path.parse(destAbsolute);

						const updatedFilename = `${filename}-latest${ext}`;

						const updatedFileAbsolute = path.resolve(
							dir,
							updatedFilename,
						);

						const relativeFilePath = path.relative(
							rootPath,
							updatedFileAbsolute,
						);

						/**
						 * Since backtrack-stats tracks the latest srcHash,
						 * only copy latest file if source has changed.
						 */
						if (srcHash === previousHash) {
							return acc;
						}

						log.info(
							`Changed file ${destFile} source updated. Copying to: ${relativeFilePath}`,
						);

						const copyFile = {
							src: srcAbsolute,
							dest: updatedFileAbsolute,
						};

						return [
							...acc,
							copyFile,
						];
					}

					log.info(`Updating file: ${destFile}`);
				} else {
					log.info(`Adding file: ${destFile}`);
				}

				const destAbsolute = dest.absolute[destFile];
				const copyFile = {
					src: srcAbsolute,
					dest: destAbsolute,
				};

				return [
					...acc,
					copyFile,
				];
			}

			return acc;
		},
		[],
	);

	/**
	 * Bail early if nothing else to do
	 */
	if (filesToCopy.length === 0) {
		return;
	}

	/**
	 * Copy all files
	 *
	 * Must overwrite because source files can change
	 * Safe to overwrite because changed dest files have been backed up
	 */
	await copy(filesToCopy);
}

export { copyFiles };
