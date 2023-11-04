import fse from 'fs-extra';
import { toArray } from './object-utils';

/**
 * See https://github.com/jprichardson/node-fs-extra/blob/master/docs/ensureDir.md#ensuredirdir-callback
 */
async function makeDirs(dirs: string[] | string): Promise<readonly string[]> {
	const normalized = toArray(dirs);

	const result = await Promise.all(
		normalized.map((dir): Promise<string | undefined | null> => {
			// @ts-expect-error ensure dir does not have correct TS signature as of @types/fs-extra v8.1.0
			return fse.ensureDir(dir);
		}),
	);

	// Use reduce instead of filter to appease TS
	const removeVoid: string[] = result.reduce((acc: string[], dir) => {
		if (typeof dir !== 'string') {
			return acc;
		}

		return [
			...acc,
			dir,
		];
	}, []);

	return removeVoid;
}

export { makeDirs };
