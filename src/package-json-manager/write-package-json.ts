import path from 'path';
import { writeFile } from 'fs-extra';
import { rootPath } from '../config/paths';
import log from '../utils/log';
import { PackageJson } from '../types';

async function writePackageJson(packageJson: PackageJson): Promise<void> {
	const packageJsonFile = path.resolve(rootPath, 'package.json');

	await writeFile(
		packageJsonFile,
		// eslint-disable-next-line prefer-template
		JSON.stringify(packageJson, null, 2) + '\n',
	);

	log.info('package.json updated');
}

export { writePackageJson };
