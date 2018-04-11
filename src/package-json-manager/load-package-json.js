/* @flow */

import path from 'path';
import { existsSync } from 'fs';
import { rootPath } from '../config/paths';

import type { PackageJson } from '../types.js';

function loadPackageJson(): PackageJson {
    const file = path.resolve(rootPath, 'package.json');
    const exists = existsSync(file);

    if (exists === false) {
        throw new Error('package.json not found');
    }

    const load = require(file);
    return load;
}

export { loadPackageJson };
