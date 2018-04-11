/* @flow */

import path from 'path';
import { buildPath, sourcePath, rootPath } from '../config/paths';
import { filesPostProcessor } from './files-post-processor';

// eslint-disable-next-line flowtype/require-exact-type
type Args = {
    value: {
        files?: $ReadOnlyArray<Object>,
    },
};

function postProcessor({ value }: Args) {
    const makeDirs = [buildPath, sourcePath].map((dir) => {
        return path.relative(rootPath, dir);
    });

    const currentFiles = value.files ? value.files : [];

    const files = filesPostProcessor({
        value: [{ makeDirs }, ...currentFiles],
    });

    return {
        ...value,
        files,
    };
}

export { postProcessor };
