import path from 'path';
import { existsSync } from 'fs';
import { normalizeStats } from './normalize-stats';
import { rootPath } from '../config/paths';

import { StatsFile } from '../types';

const statsFilename = '.backtrack-stats.json';

function loadStatsFile(): StatsFile {
	const file = path.resolve(rootPath, statsFilename);
	const exists = existsSync(file);

	if (!exists) {
		return {};
	}

	const load: StatsFile = require(file);

	const normalized = normalizeStats.load(load);

	return normalized;
}

export { loadStatsFile };
