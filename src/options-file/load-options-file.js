/* @flow */

import cosmiconfig from 'cosmiconfig';
import { rootPath } from '../config/paths';
import type { Preset } from '../types.js';

function transform(result) {
    /**
     * Handle missing config file
     *
     * TODO: ask to create default backtrack config file with found presets in package.json
     */
    if (result === null) {
        throw new Error('backtrack config not found');
    }

    let config = result.config;

    /**
     * Handle ES Modules
     */
    if (typeof config === 'object' && config.__esModule) {
        if (config.default) {
            config = config.default;
        } else {
            throw new Error(
                `${result.filepath} must use default export with ES Modules`,
            );
        }
    }

    return {
        ...result,
        config,
    };
}

const explorer = cosmiconfig('backtrack', {
    rcExtensions: true,
    sync: true,
    transform,
});

function loadOptionsFile(searchPath: string = rootPath): Preset {
    const { config } = explorer.load(searchPath);

    return config;
}

export { loadOptionsFile };
