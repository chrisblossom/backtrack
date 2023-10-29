import path from 'path';
import { existsSync, writeFileSync } from 'fs';
import sortKeys from 'sort-keys';
import { isEqual } from 'lodash';
import del from 'del';
import { rootPath } from '../config/paths';
import log from '../utils/log';
import { StatsFile } from '../types';
import { normalizeStats } from './normalize-stats';

const statsFilename = '.backtrack-stats.json';

async function writeStatsFile(
	// eslint-disable-next-line default-param-last
	sections: StatsFile = {},
	previousStats?: StatsFile,
): Promise<void> {
	const statsFile = path.resolve(rootPath, statsFilename);

	const filterEmptySections: StatsFile = Object.keys(sections).reduce(
		(acc, section) => {
			const matchedSection =
				// @ts-ignore
				sections[section] !== undefined ? sections[section] : {};

			if (Object.keys(matchedSection).length === 0) {
				return acc;
			}

			return {
				...acc,
				[section]: matchedSection,
			};
		},
		{},
	);

	/**
	 * remove stats file if there are no stats
	 */
	const shouldDelete = Object.keys(filterEmptySections).reduce(
		(acc: number[], section) => {
			// @ts-ignore
			const matchedSection = filterEmptySections[section];
			if (matchedSection === undefined) {
				return acc;
			}

			return [
				...acc,
				Object.keys(matchedSection).length,
			];
		},
		[],
	);

	if (shouldDelete.length === 0) {
		const exists = existsSync(statsFile);

		/**
		 * Do not remove anything if the file does not exist
		 */
		if (exists === true) {
			await del(statsFile);

			log.info(`No stats found, ${statsFilename} deleted`);
		}

		return;
	}

	const normalized = normalizeStats.write(filterEmptySections);

	/**
	 * Sort stats file to keep consistency for git changes
	 */
	const sorted = sortKeys(normalized, { deep: true });

	/**
	 * Do not write file if stats have not changed
	 */
	if (isEqual(sorted, previousStats)) {
		return;
	}

	writeFileSync(
		statsFile,
		// eslint-disable-next-line prefer-template
		JSON.stringify(sorted, null, 4) + '\n',
	);

	log.info(`${statsFilename} updated`);
}

export { writeStatsFile };
