/* @flow */

import path from 'path';
import { buildPath } from '../config/paths';

import type { NormalizedClean } from '../types.js';

/**
 * Patterns are only allowed inside the buildPath.
 */
const base = {
    del: [],
    makeDirs: [],
};

// eslint-disable-next-line flowtype/require-exact-type
type Args = {
    value: $ReadOnlyArray<NormalizedClean>,
    current?: NormalizedClean,
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
                const resolvedDir = path.resolve(buildPath, dir);

                /**
                 * remove duplicates
                 */
                if (acc.makeDirs.includes(resolvedDir) === false) {
                    acc.makeDirs.push(resolvedDir);
                }
            });

            return acc;
        },
        {
            del: [...current.del],
            makeDirs: [...current.makeDirs],
        },
    );
}

export { cleanProcessor };
