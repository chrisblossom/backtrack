import path from 'path';
import { buildPath, rootPath } from '../config/paths';
import { fileIsInsideDirSync } from '../utils/file-is-inside-dir';
import { NormalizedClean } from '../types';

interface Args {
	value: NormalizedClean[];
}

function cleanValidator({ value }: Args): void {
	for (const arg of value) {
		for (const pattern of arg.del) {
			const resolvedPattern = path.resolve(buildPath, pattern);
			if (fileIsInsideDirSync(resolvedPattern, buildPath) === false) {
				throw new Error(
					`del pattern '${pattern}' must be inside build directory`,
				);
			}
		}

		for (const dir of arg.makeDirs) {
			if (fileIsInsideDirSync(dir, buildPath) === false) {
				throw new Error(
					`makeDirs '${dir}' must be inside build directory`,
				);
			}
		}

		for (const copy of arg.copy) {
			if (fileIsInsideDirSync(copy.src, rootPath) === false) {
				throw new Error(
					`copy.src '${copy.src}' must be inside project root directory`,
				);
			}

			if (fileIsInsideDirSync(copy.src, buildPath) === true) {
				throw new Error(
					`copy.src '${copy.src}' cannot be inside build directory`,
				);
			}

			if (fileIsInsideDirSync(copy.dest, buildPath) === false) {
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
