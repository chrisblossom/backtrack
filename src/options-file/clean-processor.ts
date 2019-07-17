import { NormalizedClean } from '../types';

/**
 * Patterns are only allowed inside the buildPath.
 */
const base = {
	del: [],
	makeDirs: [],
	copy: [],
};

type Args = {
	value: Array<NormalizedClean>;
	current?: NormalizedClean;
};

function cleanProcessor({ value, current = base }: Args) {
	return value.reduce(
		(acc, arg) => {
			arg.del.forEach((pattern) => {
				/**
				 * remove duplicates
				 */
				if (acc.del.includes(pattern) === false) {
					acc.del.push(pattern);
				}
			});

			arg.makeDirs.forEach((dir) => {
				/**
				 * remove duplicates
				 */
				if (acc.makeDirs.includes(dir) === false) {
					acc.makeDirs.push(dir);
				}
			});

			arg.copy.forEach((copy) => {
				/**
				 * remove duplicates
				 */
				const isDuplicate = !!acc.copy.find((copyArg) => {
					return (
						copyArg.src === copy.src && copyArg.dest === copy.dest
					);
				});

				if (isDuplicate === false) {
					acc.copy.push(copy);
				}
			});

			return acc;
		},
		{
			del: [...current.del],
			makeDirs: [...current.makeDirs],
			copy: [...current.copy],
		},
	);
}

export { cleanProcessor };
