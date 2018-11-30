import path from 'path';
import { writeFileSync } from 'fs';
import { rootPath } from '../config/paths';
import log from '../utils/log';

import { PackageJson } from '../types';

function writePackageJson(packageJson: PackageJson) {
    const packageJsonFile = path.resolve(rootPath, 'package.json');

    writeFileSync(
        packageJsonFile,
        // eslint-disable-next-line prefer-template
        JSON.stringify(packageJson, null, 2) + '\n',
    );

    log.info('package.json updated');
}

export { writePackageJson };
