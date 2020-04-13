import path from 'path';
import { existsSync } from 'fs';
import { rootPath } from '../config/paths';
import { PackageJson } from '../types';

function loadPackageJson(): PackageJson {
	const file = path.resolve(rootPath, 'package.json');
	const exists = existsSync(file);

	if (exists === false) {
		throw new Error('package.json not found');
	}

	const load = require(file);

	// eslint-disable-next-line @typescript-eslint/no-unsafe-return
	return load;
}

export { loadPackageJson };
