import path from 'path';
import { existsSync } from 'fs';
import { rootPath } from '../config/paths';
import { getFileHash } from './get-file-hash';

type Return = Readonly<{
	absolute: string;
	relative: string;
	hash: string;
}>;

function parseFilePath(file: string): Return {
	const absolute = path.resolve(rootPath, file);
	const relative = path.relative(rootPath, absolute);

	const exists = existsSync(absolute);
	if (exists === false) {
		return {
			absolute,
			relative,
			hash: '',
		};
	}

	const hash = getFileHash(absolute);
	return {
		absolute,
		relative,
		hash,
	};
}

export { parseFilePath };
