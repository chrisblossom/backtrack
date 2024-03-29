import path from 'path';
import { rootPath } from '../config/paths';

function normalizePathname(pathname: string): string {
	const normalized = path.relative(rootPath, pathname);

	return normalized;
}

export { normalizePathname };
