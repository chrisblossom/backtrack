import path from 'path';
import { realpath, realpathSync } from 'fs-extra';
import { rootPath } from '../config/paths';

/**
 * get the real file path to handle symlinks
 *
 * Not used to check if file exists. Return original file if realpathSync fails
 *
 * WARNING: NOT PROPERLY TESTED
 */
async function getRealPath(file: string): Promise<string> {
	try {
		const result = await realpath(file);

		return result;
	} catch {
		return file;
	}
}

function getRealPathSync(file: string): string {
	try {
		const result = realpathSync(file);

		return result;
	} catch {
		return file;
	}
}

/**
 * Check if a file is inside a directory. Handles absolute and relative
 * Assumes rootPath if not specified
 */
async function fileIsInsideDir(
	file: string,
	dir: string = rootPath,
): Promise<boolean> {
	if (file === '') {
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

	const realPathResult = await getRealPath(absoluteFilePath);
	const realPath = path.relative(rootPath, realPathResult);

	const truncatedPath = realPath.slice(0, normalizedDir.length);

	const isInside = truncatedPath === normalizedDir;

	return isInside;
}

function fileIsInsideDirSync(file: string, dir: string = rootPath): boolean {
	if (file === '') {
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

	const realPath = path.relative(rootPath, getRealPathSync(absoluteFilePath));

	const truncatedPath = realPath.slice(0, normalizedDir.length);

	const isInside = truncatedPath === normalizedDir;

	return isInside;
}

export { fileIsInsideDir, fileIsInsideDirSync };
