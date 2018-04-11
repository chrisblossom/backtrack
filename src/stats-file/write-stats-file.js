/* @flow */

import path from 'path';
import sortKeys from 'sort-keys';
import { existsSync, writeFileSync } from 'fs';
import { isEqual } from 'lodash';
import del from 'del';
import { normalizeStats } from './normalize-stats';
import { rootPath } from '../config/paths';
import log from '../utils/log';

import type { StatsFile } from '../types.js';

const statsFilename = '.backtrack-stats.json';

async function writeStatsFile(
    sections: StatsFile = {},
    previousStats: ?StatsFile,
) {
    const statsFile = path.resolve(rootPath, statsFilename);

    const filterEmptySections: StatsFile = Object.keys(sections).reduce(
        (acc, section) => {
            const matchedSection = sections[section] || {};

            if (Object.keys(matchedSection).length === 0) {
                return acc;
            }

            return {
                ...acc,
                // $FlowIssue
                [section]: matchedSection,
            };
        },
        {},
    );

    /**
     * remove stats file if there are no stats
     */
    const shouldDelete = Object.keys(filterEmptySections)
        .map((section) => {
            const matchedSection = filterEmptySections[section];
            if (matchedSection) {
                return Object.keys(matchedSection).length;
            }

            return null;
        })
        .filter(Boolean);

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
