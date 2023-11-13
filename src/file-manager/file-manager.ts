import path from 'path';
import { makeDirs } from '../utils/make-dirs';
import log from '../utils/log';
import { rootPath } from '../config/paths';
import { filesPostProcessor } from '../options-file/files-post-processor';
import { ParsedFiles, FileManagerStats } from '../types';
import { backupChangedFiles } from './backup-changed-files';
import { removeStaleFiles } from './remove-stale-files';
import { removeStaleDirectories } from './remove-stale-directories';
import { copyFiles } from './copy-files';
import { getFileStats } from './get-file-stats';

type Return = Promise<FileManagerStats>;

async function fileManager(
	files?: ParsedFiles,
	previousStats: FileManagerStats = {},
): Return {
	const filesNormalized = files ?? filesPostProcessor();

	/**
	 * Create Directories
	 */
	const createDirectories = await makeDirs(filesNormalized.makeDirs);

	createDirectories.forEach((absolutePath) => {
		const relativeDir = path.relative(rootPath, absolutePath);

		log.info(`Creating directory: ${relativeDir}`);
	});

	/**
	 * Backup any user-changed files
	 */
	await backupChangedFiles(filesNormalized, previousStats.files);

	/**
	 * Remove stale files
	 */
	await removeStaleFiles(filesNormalized, previousStats.files);

	/**
	 * Remove stale directories
	 */
	await removeStaleDirectories(filesNormalized, previousStats.directories);

	/**
	 * Copy files
	 */
	await copyFiles(filesNormalized, previousStats.files);

	/**
	 * Get updated stats
	 */
	const fileStats = getFileStats(filesNormalized);

	return fileStats;
}

export { fileManager };
