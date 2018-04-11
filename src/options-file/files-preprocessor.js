/* @flow */

import path from 'path';
import { toArray } from '../utils/object-utils';

import type { Files } from '../types.js';

// eslint-disable-next-line flowtype/require-exact-type
type Args = {
    value: Files,
    dirname: string,
};

function filesPreprocessor({ value, dirname }: Args = {}) {
    const resolveSrc = toArray(value).map((files) => {
        if (typeof files === 'boolean') {
            return files;
        }

        if (!files.src) {
            return files;
        }

        const src = path.resolve(dirname, files.src);

        return {
            ...files,
            src,
        };
    });

    return resolveSrc;
}

export { filesPreprocessor };
