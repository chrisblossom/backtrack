/* @flow */

import path from 'path';
import { rootPath } from '../config/paths';
import { backupFile } from '../utils/backup-file';
import log from '../utils/log';

import type { ParsedFiles, FileStats } from '../types.js';

async function backupChangedFiles(
    files: ParsedFiles,
    previousStats?: FileStats = {},
) {
    const backupNewFiles = files.dest.files
        .map((destFile) => {
            /**
             * This only handles new files
             */
            const previousFileHash = previousStats[destFile];
            if (previousFileHash) {
                return null;
            }

            const destFileIndex = files.dest.files.indexOf(destFile);
            const srcFile = files.src.files[destFileIndex];
            const srcHash = files.src.hash[srcFile];
            const destHash = files.dest.hash[destFile];
            const destExists = !!destHash;

            /**
             * Don't backup if file doesn't exist or the files are the same
             */
            if (!destExists || srcHash === destHash) {
                return null;
            }

            const originalFilePath = files.dest.absolute[destFile];
            return backupFile(originalFilePath).then((backupResult) => {
                if (backupResult) {
                    const relativeBackupFilePath = path.relative(
                        rootPath,
                        backupResult.file,
                    );

                    const relativeFilePath = path.relative(
                        rootPath,
                        originalFilePath,
                    );

                    log.warn(
                        `${relativeFilePath} already exists. Moving to ${relativeBackupFilePath}`,
                    );
                }

                return backupResult;
            });
        })
        .filter(Boolean);

    const backupOldFiles = Object.keys(previousStats)
        .map((destFile) => {
            const destHash = files.dest.hash[destFile];

            const previousFileHash = previousStats[destFile];
            const destExists = !!destHash;

            const destFileIndex = files.dest.files.indexOf(destFile);

            /**
             * Need to check for undefined because previousStats source file could have been removed
             */
            const srcFile =
                destFileIndex !== -1
                    ? files.src.files[destFileIndex]
                    : undefined;

            const srcHash = srcFile ? files.src.hash[srcFile] : undefined;

            /**
             * Do not backup file if changes are allowed
             */
            const allowChanges = files.dest.allowChanges[destFile];
            if (allowChanges === true) {
                return null;
            }

            /**
             * Don't backup if dest hasn't changed
             */
            if (
                destExists === false ||
                previousFileHash === destHash ||
                // already correct hash
                srcHash === destHash
            ) {
                return null;
            }

            /**
             * Move current destFile if modified
             */
            const originalFilePath = files.dest.absolute[destFile];

            return backupFile(originalFilePath).then((backupResult) => {
                if (backupResult) {
                    const relativeBackupFilePath = path.relative(
                        rootPath,
                        backupResult.file,
                    );

                    const relativeFilePath = path.relative(
                        rootPath,
                        originalFilePath,
                    );

                    log.warn(
                        `${relativeFilePath} hash mismatch. Moving to ${relativeBackupFilePath}`,
                    );
                }

                return backupResult;
            });
        })
        .filter(Boolean);

    await Promise.all([...backupNewFiles, ...backupOldFiles]);
}

export { backupChangedFiles };
