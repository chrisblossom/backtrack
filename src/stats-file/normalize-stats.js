/* @flow */

import path from 'path';
import slash from 'slash';
import type { StatsFile } from '../types.js';

/**
 * Normalize all paths to be compatible with current operating system
 */
function normalizeStats(stats: StatsFile, type: 'load' | 'write') {
    if (!stats.fileManager) {
        return stats;
    }

    /**
     * If loading stats file, we want the path to use the native OS paths
     *
     * When writing stats we want to use unix paths
     */
    const normalizer = type === 'load' ? path.normalize : slash;

    const directories = stats.fileManager.directories;
    const files = stats.fileManager.files;
    const normalizedFileManager = {};

    if (directories) {
        normalizedFileManager.directories = directories.map((dir) => {
            const normalizedDir = normalizer(dir);

            return normalizedDir;
        });
    }

    if (files) {
        normalizedFileManager.files = Object.keys(files).reduce((acc, dir) => {
            const checksum = files[dir];
            const normalizedKey = normalizer(dir);

            return {
                ...acc,
                [normalizedKey]: checksum,
            };
        }, {});
    }

    return {
        ...stats,
        fileManager: normalizedFileManager,
    };
}

function load(stats: StatsFile) {
    return normalizeStats(stats, 'load');
}

function write(stats: StatsFile) {
    return normalizeStats(stats, 'write');
}

normalizeStats.load = load;
normalizeStats.write = write;

export { normalizeStats };
