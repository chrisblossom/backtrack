import path from 'path';
import { existsSync, promises as fs } from 'fs';
import del from 'del';
import { rootPath } from '../config/paths';
import log from '../utils/log';
import { normalizePathname } from '../utils/normalize-pathname';
import { fileIsInsideDir } from '../utils/file-is-inside-dir';
import { ParsedFiles, DirStats } from '../types';

async function shouldDelete(
	relativeDir: string,
	makeDirs: string[] = [],
): Promise<void> {
	async function goUpOne(): Promise<void> {
		const upOneDir = path.join(relativeDir, '..');
		if (upOneDir === '.') {
			return;
		}

		await shouldDelete(upOneDir, makeDirs);
	}

	if (makeDirs.includes(relativeDir) === true) {
		return;
	}

	const absolutePath = path.resolve(rootPath, relativeDir);
	const exists = existsSync(absolutePath);
	if (exists === false) {
		await goUpOne();

		return;
	}

	const isInsideManagedDir = makeDirs.some((dir) => {
		return fileIsInsideDir(dir, relativeDir);
	});

	if (isInsideManagedDir === true) {
		return;
	}

	const directoryList = await fs.readdir(absolutePath);
	if (directoryList.length !== 0) {
		log.info(`Directory not empty: ${relativeDir}`);

		return;
	}

	if (path.resolve(relativeDir) === rootPath) {
		return;
	}

	log.info(`Removing directory: ${relativeDir}`);

	await del(absolutePath);

	await goUpOne();
}

async function removeStaleDirectories(
	parsedFiles: ParsedFiles,
	previousStats: DirStats = [],
): Promise<void> {
	for (const dir of previousStats) {
		const normalizedDir = normalizePathname(dir);

		/**
		 * Run sequentially to ensure directories are empty before moving to next
		 */
		// eslint-disable-next-line no-await-in-loop
		await shouldDelete(normalizedDir, parsedFiles.makeDirs);
	}
}

export { removeStaleDirectories };
