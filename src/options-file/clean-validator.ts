import path from 'path';
import { buildPath, rootPath } from '../config/paths';
import { fileIsInsideDir } from '../utils/file-is-inside-dir';
import { NormalizedClean } from '../types';

type Args = Readonly<{
	value: readonly NormalizedClean[];
}>;

function cleanValidator({ value }: Args) {
	for (const arg of value) {
		for (const pattern of arg.del) {
			const resolvedPattern = path.resolve(buildPath, pattern);
			if (fileIsInsideDir(resolvedPattern, buildPath) === false) {
				throw new Error(
					`del pattern '${pattern}' must be inside build directory`,
				);
			}
		}

		for (const dir of arg.makeDirs) {
			if (fileIsInsideDir(dir, buildPath) === false) {
				throw new Error(
					`makeDirs '${dir}' must be inside build directory`,
				);
			}
		}

		for (const copy of arg.copy) {
			if (fileIsInsideDir(copy.src, rootPath) === false) {
				throw new Error(
					`copy.src '${copy.src}' must be inside project root directory`,
				);
			}

			if (fileIsInsideDir(copy.src, buildPath) === true) {
				throw new Error(
					`copy.src '${copy.src}' cannot be inside build directory`,
				);
			}

			if (fileIsInsideDir(copy.dest, buildPath) === false) {
				throw new Error(
					`copy.dest '${copy.dest}' must be inside build directory`,
				);
			}

			const isDuplicateWithHashMismatch = !!arg.copy.find((copyArg) => {
				return (
					copyArg.src === copy.src &&
					copyArg.dest === copy.dest &&
					copyArg.hash !== copy.hash
				);
			});

			if (isDuplicateWithHashMismatch) {
				throw new Error(
					`copy.src '${copy.src}' is duplicated with mismatched hash: true/false`,
				);
			}

			const isDuplicateWithSrcMismatch = !!arg.copy.find((copyArg) => {
				return copyArg.src !== copy.src && copyArg.dest === copy.dest;
			});

			if (isDuplicateWithSrcMismatch) {
				throw new Error(
					`copy.dest '${copy.dest}' is duplicated with mismatched sources`,
				);
			}
		}
	}
}

export { cleanValidator };
