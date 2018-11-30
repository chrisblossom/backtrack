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
const getRealPath = (file: string) => {
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

    let normalizedDir = path.relative(rootPath, dir) + path.sep;

    if (normalizedDir === path.sep) {
        normalizedDir = '';
    }

    const absoluteFilePath = path.relative(rootPath, file);

    const isOutsidePath = absoluteFilePath.split(path.sep)[0];
    if (isOutsidePath === '..') {
        return false;
    }

    const realPath = path.relative(rootPath, getRealPath(absoluteFilePath));

    const truncatedPath = realPath.slice(0, normalizedDir.length);

    const isInside = truncatedPath === normalizedDir;

    return isInside;
}

export { fileIsInsideDir };
