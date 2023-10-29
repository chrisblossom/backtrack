import path from 'path';
import { existsSync } from 'fs';
import Joi from '@hapi/joi';
import { fileIsInsideDir } from '../utils/file-is-inside-dir';
import { isCopyFileOptions, FileManager } from '../types';

interface Args {
	value: FileManager;
}

function filesValidator({ value }: Args): void {
	const { dest, src } = value.reduce(
		(acc: { dest: string[]; src: string[] }, file) => {
			if (isCopyFileOptions(file)) {
				return acc;
			}

			return {
				dest: [
					...acc.dest,
					file.dest,
				],
				src: [
					...acc.src,
					file.src,
				],
			};
		},
		{ dest: [], src: [] },
	);

	/**
	 * Handle duplicate files
	 */
	const destValid = Joi.array()
		.unique()
		.label('files destination')
		.validate(dest);

	if (destValid.error) {
		throw new Error(destValid.error.annotate());
	}

	for (const file of src) {
		/**
		 * Source files must be absolute
		 */
		if (path.isAbsolute(file) === false) {
			throw new Error(`source file must be an absolute path: ${file}`);
		}

		/**
		 * Do not allow external files
		 *
		 * DISABLE - does not work with lerna
		 */
		// if (fileIsInsideDir(file) === false) {
		//     throw new Error(`source file must be inside rootPath: ${file}`);
		// }

		/**
		 * Handle missing source files
		 */
		if (existsSync(file) === false) {
			throw new Error(`Source file does not exist: ${file}`);
		}
	}

	for (const file of dest) {
		/**
		 * Destination files must be relative
		 */
		if (path.isAbsolute(file) === true) {
			throw new Error(
				`Destination file must be a relative path: ${file}`,
			);
		}

		/**
		 * Do not allow external files
		 */
		if (fileIsInsideDir(file) === false) {
			throw new Error(`dest file must be inside rootPath: ${file}`);
		}
	}
}

export { filesValidator };
