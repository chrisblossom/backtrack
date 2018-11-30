import path from 'path';
import { backupChangedFiles } from './backup-changed-files';
import { removeStaleFiles } from './remove-stale-files';
import { removeStaleDirectories } from './remove-stale-directories';
import { copyFiles } from './copy-files';
import { getFileStats } from './get-file-stats';
import { makeDirs } from '../utils/make-dirs';
import log from '../utils/log';
import { rootPath } from '../config/paths';
import { filesPostProcessor } from '../options-file/files-post-processor';

import { ParsedFiles, FileManagerStats } from '../types';

type Return = Promise<FileManagerStats>;

const base = filesPostProcessor();

async function fileManager(
    files: ParsedFiles = base,
    previousStats: FileManagerStats = {},
): Return {
    /**
     * Create Directories
     */
    const createDirectories = await makeDirs(files.makeDirs);

    createDirectories.forEach((absolutePath) => {
        const relativeDir = path.relative(rootPath, absolutePath);

        log.info(`Creating directory: ${relativeDir}`);
    });

    /**
     * Backup any user-changed files
     */
    await backupChangedFiles(files, previousStats.files);

    /**
     * Remove stale files
     */
    await removeStaleFiles(files, previousStats.files);

    /**
     * Remove stale directories
     */
    await removeStaleDirectories(files, previousStats.directories);

    /**
     * Copy files
     */
    await copyFiles(files, previousStats.files);

    /**
     * Get updated stats
     */
    const fileStats = getFileStats(files);

    return fileStats;
}

export { fileManager };
