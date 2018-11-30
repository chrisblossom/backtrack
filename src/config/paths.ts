import { realpathSync } from 'fs';
import path from 'path';

/**
 * Make sure any symlinks in the project folder are resolved:
 * https://github.com/facebookincubator/create-react-app/issues/637
 */
const rootPath = realpathSync(process.cwd());
const buildPath = path.resolve(rootPath, 'dist');
const sourcePath = path.resolve(rootPath, 'src');

export { rootPath, buildPath, sourcePath };
