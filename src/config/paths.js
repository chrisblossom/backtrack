/* @flow */

import { realpathSync } from 'fs';
import path from 'path';

/**
 * Make sure any symlinks in the project folder are resolved:
 * https://github.com/facebookincubator/create-react-app/issues/637
 */
const rootPath = realpathSync(process.cwd());

const paths = {
    rootPath,
    buildPath: path.resolve(rootPath, 'dist'),
    sourcePath: path.resolve(rootPath, 'src'),
};

module.exports = Object.freeze(paths);
