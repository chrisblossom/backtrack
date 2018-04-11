/* @flow */

import fse from 'fs-extra';
import { toArray } from './object-utils';

/**
 * See https://github.com/jprichardson/node-fs-extra/blob/master/docs/ensureDir.md#ensuredirdir-callback
 */
async function makeDirs(
    dirs: $ReadOnlyArray<string> | string,
): Promise<$ReadOnlyArray<string>> {
    const normalized = toArray(dirs);

    const result = await Promise.all(
        normalized.map((dir) => {
            return fse.ensureDir(dir);
        }),
    );

    return result.filter(Boolean);
}

export { makeDirs };
