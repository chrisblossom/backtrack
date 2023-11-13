import path from 'path';
import { pathExists } from 'fs-extra';
import { rootPath } from '../config/paths';
import { PackageJson } from '../types';

async function loadPackageJson(): Promise<PackageJson> {
	const file = path.resolve(rootPath, 'package.json');
	const exists = await pathExists(file);

	if (exists === false) {
		throw new Error('package.json not found');
	}

	const load = require(file) as PackageJson;

	return load;
}

export { loadPackageJson };
