/* @flow */

import { toArray } from '../utils/object-utils';
import type { Clean, NormalizedClean } from '../types.js';

// eslint-disable-next-line flowtype/require-exact-type
type Args = {
    value?: Clean | $ReadOnlyArray<Clean>,
};

function cleanPreprocessor({ value }: Args = {}): $ReadOnlyArray<
    NormalizedClean,
> {
    const allToArray = toArray(value);

    return allToArray.map((arg: Clean) => {
        return {
            del: toArray(arg.del),
            makeDirs: toArray(arg.makeDirs),
        };
    });
}

export { cleanPreprocessor };
