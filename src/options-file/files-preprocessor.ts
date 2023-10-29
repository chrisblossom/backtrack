import path from 'path';
import { toArray } from '../utils/object-utils';
import { isCopyFileOptions, Files, CopyFile, CopyFileOptions } from '../types';

interface Args {
	value?: Files;
	dirname?: string;
}

type Return = (CopyFile | CopyFileOptions | false)[];

function filesPreprocessor({ value, dirname = '' }: Args = {}): Return {
	const resolveSrc = toArray(value).map((files) => {
		if (typeof files === 'boolean') {
			return files;
		}

		if (isCopyFileOptions(files)) {
			return files;
		}

		const src = path.resolve(dirname, files.src);

		const result: CopyFile = {
			...files,
			src,
		};

		return result;
	});

	return resolveSrc;
}

export { filesPreprocessor };
