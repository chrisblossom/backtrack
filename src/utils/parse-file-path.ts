import path from 'path';
import { pathExists, pathExistsSync } from 'fs-extra';
import { rootPath } from '../config/paths';
import { getFileHash, getFileHashSync } from './get-file-hash';

interface Return {
	absolute: string;
	relative: string;
	hash: string;
}

async function parseFilePath(file: string): Promise<Return> {
	const absolute = path.resolve(rootPath, file);
	const relative = path.relative(rootPath, absolute);

	const exists = await pathExists(absolute);
	if (exists === false) {
		return {
			absolute,
			relative,
			hash: '',
		};
	}

	const hash = await getFileHash(absolute);
	return {
		absolute,
		relative,
		hash,
	};
}

function parseFilePathSync(file: string): Return {
	const absolute = path.resolve(rootPath, file);
	const relative = path.relative(rootPath, absolute);

	const exists = pathExistsSync(absolute);
	if (exists === false) {
		return {
			absolute,
			relative,
			hash: '',
		};
	}

	const hash = getFileHashSync(absolute);
	return {
		absolute,
		relative,
		hash,
	};
}

export { parseFilePath, parseFilePathSync };
