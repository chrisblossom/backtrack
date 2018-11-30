import path from 'path';
import { existsSync } from 'fs';
import { move } from 'fs-extra';
import { getFileHash } from './get-file-hash';

import { rootPath } from '../config/paths';

type Return = Promise<{
    file: string;
    filename: string;
} | void>;

async function backupFile(file: string): Return {
    const hash = getFileHash(file);

    const { base: filename, dir, ext = '' } = path.parse(file);

    const shortHash = hash.slice(0, 8);

    let backupFilename = `${filename}-backup-${shortHash}${ext}`;
    let backupFilePath = path.resolve(dir, backupFilename);

    /**
     * Handle the same file being backed up multiple times
     */
    let previouslyBackedUp = false;
    let backupFileExists = existsSync(backupFilePath);
    if (backupFileExists) {
        let count = 0;
        const maxCount = 10;
        while (
            backupFileExists &&
            previouslyBackedUp === false &&
            count < maxCount
        ) {
            const backupFileHash = getFileHash(backupFilePath);

            /**
             * Check if the existing file has the same hash.
             *
             * Prevents backing up the same file over
             */
            if (backupFileHash === hash) {
                previouslyBackedUp = true;
            }

            backupFilename = `${filename}-backup-${shortHash}-${count}${ext}`;
            backupFilePath = path.resolve(dir, backupFilename);

            backupFileExists = existsSync(backupFilePath);
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
