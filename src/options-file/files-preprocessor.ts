import path from 'path';
import { toArray } from '../utils/object-utils';
import { isCopyFileOptions, Files } from '../types';

interface Args {
	value?: Files;
	dirname?: string;
}

function filesPreprocessor({ value, dirname = '' }: Args = {}) {
	const resolveSrc = toArray(value).map((files) => {
		if (typeof files === 'boolean') {
			return files;
		}

		if (isCopyFileOptions(files)) {
			return files;
		}

		const src = path.resolve(dirname, files.src);

		return {
			...files,
			src,
		};
	});

	return resolveSrc;
}

export { filesPreprocessor };
