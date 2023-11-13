import path from 'path';
import fse from 'fs-extra';
import { readDirDeep } from 'read-dir-deep';
import { getFileHash } from './get-file-hash';
import { toArray } from './object-utils';

export interface File {
	src: string;
	dest: string;
	hash?: boolean;

	/**
	 * fs-extra copy options
	 * https://github.com/jprichardson/node-fs-extra/blob/master/docs/copy.md#copysrc-dest-options-callback
	 */
	overwrite?: boolean;
	errorOnExist?: boolean;
	preserveTimestamps?: boolean;
}

async function getHashedName(source: string, dest: string): Promise<string> {
	const parsed = path.parse(dest);
	const fileHash = (await getFileHash(source)).substring(0, 8);

	const rename = `${parsed.name}.${fileHash}${parsed.ext}`;

	const result = path.join(parsed.dir, rename);

	return result;
}

/**
 * See https://github.com/jprichardson/node-fs-extra/blob/master/docs/copy.md#copysrc-dest-options-callback
 * for options
 */
async function copyDirectoryFiles(
	src: string,
	dest: string,
	hash: boolean,
	fseCopyOptions: fse.CopyOptions,
): Promise<void> {
	const deepFileList = await readDirDeep(src);
	const copyTasks = deepFileList.map(async (sourceFile) => {
		const absoluteSourcePath = path.resolve(src, sourceFile);
		let absoluteDestinationPath = path.resolve(dest, sourceFile);

		if (hash === true) {
			absoluteDestinationPath = await getHashedName(
				absoluteSourcePath,
				absoluteDestinationPath,
			);
		}

		await fse.copy(
			absoluteSourcePath,
			absoluteDestinationPath,
			fseCopyOptions,
		);
	});

	await Promise.all(copyTasks);
}

async function copy(files: File[] | File): Promise<void> {
	const normalized = toArray(files);

	const copyFilesResult = normalized.map(async (file) => {
		const {
			src,
			dest,
			hash = false,
			overwrite = true,
			errorOnExist = true,
			preserveTimestamps = true,
		} = file;

		const fseCopyOptions: fse.CopyOptions = {
			overwrite,
			errorOnExist,
			preserveTimestamps,
		};

		const isDirectory = (await fse.stat(src)).isDirectory();

		if (isDirectory) {
			await copyDirectoryFiles(src, dest, hash, fseCopyOptions);

			return;
		}

		const finalDest = hash === true ? await getHashedName(src, dest) : dest;
		await fse.copy(src, finalDest, fseCopyOptions);
	});

	await Promise.all(copyFilesResult);
}

export { copy };
