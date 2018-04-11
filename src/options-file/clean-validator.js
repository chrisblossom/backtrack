/* @flow */

import { buildPath } from '../config/paths';
import { fileIsInsideDir } from '../utils/file-is-inside-dir';

import type { NormalizedClean } from '../types.js';

// eslint-disable-next-line flowtype/require-exact-type
type Args = {
    value: $ReadOnlyArray<NormalizedClean>,
};

function cleanValidator({ value }: Args) {
    for (const arg of value) {
        for (const pattern of arg.del) {
            if (fileIsInsideDir(pattern, buildPath) === false) {
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
    }
}

export { cleanValidator };
