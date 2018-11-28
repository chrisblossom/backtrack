/* @flow */

import path from 'path';
import { toArray } from '../utils/object-utils';
import { buildPath, rootPath } from '../config/paths';
import type { Clean, NormalizedClean } from '../types.js';

// eslint-disable-next-line flowtype/require-exact-type
type Args = {
    value?: Clean | $ReadOnlyArray<Clean>,
};

function cleanPreprocessor({
    value,
}: Args = {}): $ReadOnlyArray<NormalizedClean> {
    const allToArray = toArray(value);

    return allToArray.map((arg: Clean) => {
        const makeDirs = toArray(arg.makeDirs).map((makeDir) => {
            const resolvedMakeDir = path.resolve(buildPath, makeDir);
            return resolvedMakeDir;
        });

        const copy = toArray(arg.copy).map((copyArgs) => {
            const resolvedSrc = path.resolve(rootPath, copyArgs.src);
            const resolvedDest = path.resolve(buildPath, copyArgs.dest);

            const result = {
                src: resolvedSrc,
                dest: resolvedDest,
                hash: copyArgs.hash,
            };

            if (result.hash === undefined) {
                delete result.hash;
            }

            return result;
        });

        return {
            del: toArray(arg.del),
            makeDirs,
            copy,
        };
    });
}

export { cleanPreprocessor };
