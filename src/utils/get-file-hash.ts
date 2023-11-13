import { createHash } from 'crypto';
import { readFile, readFileSync } from 'fs-extra';

async function getFileHash(file: string, type = 'sha256'): Promise<string> {
	const fileBody = await readFile(file);
	const hash = createHash(type).update(fileBody).digest('hex');

	return hash;
}

function getFileHashSync(file: string, type = 'sha256'): string {
	const fileBody = readFileSync(file);
	const hash = createHash(type).update(fileBody).digest('hex');

	return hash;
}

export { getFileHash, getFileHashSync };
