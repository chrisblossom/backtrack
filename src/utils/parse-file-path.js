/* @flow */

import path from 'path';
import { existsSync } from 'fs';
import { getFileHash } from './get-file-hash';

import { rootPath } from '../config/paths';

type Return = {|
    absolute: string,
    relative: string,
    hash: string,
|};

function parseFilePath(file: string): Return {
    const absolute = path.resolve(rootPath, file);
    const relative = path.relative(rootPath, absolute);

    const exists = existsSync(absolute);
    if (exists === false) {
        return {
            absolute,
            relative,
            hash: '',
        };
    }

    const hash = getFileHash(absolute);
    return {
        absolute,
        relative,
        hash,
    };
}

export { parseFilePath };
