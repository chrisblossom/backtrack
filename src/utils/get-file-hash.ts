import { readFileSync } from 'fs';
import { createHash } from 'crypto';

function getFileHash(file: string, type = 'sha256'): string {
	const fileBody = readFileSync(file);
	const hash = createHash(type).update(fileBody).digest('hex');

	return hash;
}

export { getFileHash };
