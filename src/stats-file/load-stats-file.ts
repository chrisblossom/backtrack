import path from 'path';
import { pathExists } from 'fs-extra';
import { rootPath } from '../config/paths';
import { StatsFile } from '../types';
import { normalizeStats } from './normalize-stats';

const statsFilename = '.backtrack-stats.json';

async function loadStatsFile(): Promise<StatsFile> {
	const file = path.resolve(rootPath, statsFilename);
	const exists = await pathExists(file);

	if (exists === false) {
		return {};
	}

	const load = require(file) as StatsFile;

	const normalized = normalizeStats.load(load);

	return normalized;
}

export { loadStatsFile };
