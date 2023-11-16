import path from 'path';
import { copy, File } from '../utils/copy';
import log from '../utils/log';
import { rootPath } from '../config/paths';
import { ParsedFiles, FileStats } from '../types';

// prettier-ignore
type CopyInfo =
	{ shouldCopy: false } |
	{ shouldCopy: true; destPath: string };

/*
 * Handles the logic for when file changes are allowed.
 * It determines if a file should be copied and creates a new filename with '-latest'.
 */
function handleAllowedChanges(
	files: ParsedFiles,
	destFile: string,
	srcHash: string,
	previousHash: string,
): CopyInfo {
	const destAbsolute = files.dest.absolute[destFile];
	const { base: filename, dir, ext = '' } = path.parse(destAbsolute);
	const updatedFilename = `${filename}-latest${ext}`;
	const updatedFileAbsolute = path.resolve(dir, updatedFilename);
	const relativeFilePath = path.relative(rootPath, updatedFileAbsolute);

	/**
	 * Since backtrack-stats tracks the latest srcHash,
	 * only copy latest file if source has changed.
	 */
	if (srcHash === previousHash) {
		return { shouldCopy: false };
	}

	log.info(
		`Changed file ${destFile} source updated. Copying to: ${relativeFilePath}`,
	);

	return { shouldCopy: true, destPath: updatedFileAbsolute };
}

/*
 * Determines whether a file should be copied based on its hash and other criteria.
 */
function shouldCopyFile(
	files: ParsedFiles,
	destFile: string,
	srcHash: string,
	destHash: string,
	previousStats: FileStats,
): CopyInfo {
	if (destHash) {
		const previousHash = previousStats[destFile];
		const ignoreUpdates = files.dest.ignoreUpdates[destFile];

		/**
		 * Do not copy if ignoreUpdates is true and file already exists
		 */
		if (ignoreUpdates && previousHash !== srcHash) {
			log.info(
				`Unmanaged file ${destFile} source changed. Updating .backtrack-stats.json`,
			);
			return { shouldCopy: false };
		}

		/**
		 * Do not copy if changes are allowed and destFile has been modified
		 */
		const allowChanges = files.dest.allowChanges[destFile];
		if (allowChanges && destHash !== previousHash) {
			return handleAllowedChanges(files, destFile, srcHash, previousHash);
		}

		log.info(`Updating file: ${destFile}`);
	} else {
		log.info(`Adding file: ${destFile}`);
	}

	return { shouldCopy: true, destPath: files.dest.absolute[destFile] };
}

/*
 * Creates a list of files to be copied by evaluating each source file.
 */
function getFilesToCopy(files: ParsedFiles, previousStats: FileStats): File[] {
	return files.src.files.reduce<File[]>((acc, srcFile, index) => {
		const destFile = files.dest.files[index];
		const srcHash = files.src.hash[srcFile];
		const destHash = files.dest.hash[destFile];

		if (srcHash !== destHash) {
			const srcAbsolute = files.src.absolute[srcFile];
			const destAbsolute = files.dest.absolute[destFile];

			const copyInfo = shouldCopyFile(
				files,
				destFile,
				srcHash,
				destHash,
				previousStats,
			);

			if (copyInfo.shouldCopy) {
				acc.push({
					src: srcAbsolute,
					dest: copyInfo.destPath ?? destAbsolute,
				});
			}
		}

		return acc;
	}, []);
}

/*
 * Main function to copy files.
 * It determines which files need to be copied and performs the copy operation.
 */
async function copyFiles(
	files: ParsedFiles,
	previousStats: FileStats = {},
): Promise<void> {
	const filesToCopy = getFilesToCopy(files, previousStats);

	// nothing to copy
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
