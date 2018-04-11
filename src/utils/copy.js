/* @flow */

import fse from 'fs-extra';
import { toArray } from './object-utils';

import type { CopyFile } from '../types.js';

/**
 * See https://github.com/jprichardson/node-fs-extra/blob/master/docs/copy.md#copysrc-dest-options-callback
 * for options
 */
async function copy(files: $ReadOnlyArray<CopyFile> | CopyFile, options: {}) {
    const normalized = toArray(files);

    /**
     * Does not return any information
     */
    await Promise.all(
        normalized.map((file) => {
            return fse.copy(file.src, file.dest, options);
        }),
    );
}

export { copy };
