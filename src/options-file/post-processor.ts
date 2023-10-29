import path from 'path';
import { buildPath, sourcePath, rootPath } from '../config/paths';
import type { ParsedFiles } from '../types';
import { filesPostProcessor } from './files-post-processor';

interface Args {
	value: {
		files?: readonly Record<string, unknown>[];
	};
}

interface Return {
	files: ParsedFiles;
}

function postProcessor({ value }: Args): Return {
	const makeDirs = [
		buildPath,
		sourcePath,
	].map((dir) => {
		return path.relative(rootPath, dir);
	});

	const currentFiles = value.files ? value.files : [];

	const files = filesPostProcessor({
		value: [
			{ makeDirs },
			...currentFiles,
		],
	});

	const result = {
		...value,
		files,
	};

	return result;
}

export { postProcessor };
