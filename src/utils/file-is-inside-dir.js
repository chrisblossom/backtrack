/* @flow */

import path from 'path';
import { realpathSync } from 'fs';
import { rootPath } from '../config/paths';

/**
 * get the real file path to handle symlinks
 *
 * Not used to check if file exists. Return original file if realpathSync fails
 *
 * WARNING: NOT PROPERLY TESTED
 */
const getRealPath = (file) => {
    try {
        return realpathSync(file);
    } catch (error) {
        return file;
    }
};

/**
 * Check if a file is inside a directory. Handles absolute and relative
 * Assumes rootPath if not specified
 */
function fileIsInsideDir(file: string, dir: string = rootPath): boolean {
    if (!file) {
        return false;
    }

    const normalizedDir = path.normalize(dir) + path.sep;
    const absoluteFilePath = path.resolve(normalizedDir, file);

    const realPath = getRealPath(absoluteFilePath);

    const truncatedPath = realPath.slice(0, normalizedDir.length);

    return truncatedPath === normalizedDir;
}

export { fileIsInsideDir };
