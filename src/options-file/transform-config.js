/* @flow */

import ExConfig from 'ex-config';
import { Preprocessor } from './preprocessor';
import { postProcessor } from './post-processor';
import { presetValidator } from './preset-validator';
import { cleanPreprocessor } from './clean-preprocessor';
import { cleanValidator } from './clean-validator';
import { cleanProcessor } from './clean-processor';
import { filesPreprocessor } from './files-preprocessor';
import { filesValidator } from './files-validator';

import { rootPath } from '../config/paths';

import type { Lifecycles, Preset } from '../types.js';

function transformConfig(
    config: Preset,
    dirname?: string = rootPath,
): Lifecycles {
    /**
     * Needs to be placed inside function for caching reasons
     */
    const options = {
        preprocessor: new Preprocessor(),
        postProcessor,
        plugins: false,
        validator: presetValidator,
        processor: 'arrayPush',
        overrides: {
            presets: {
                resolve: {
                    prefix: 'backtrack-preset',
                    org: '@backtrack',
                    orgPrefix: 'preset',
                },
            },
            clean: {
                preprocessor: cleanPreprocessor,
                validator: cleanValidator,
                processor: cleanProcessor,
            },
            files: {
                preprocessor: filesPreprocessor,
                validator: filesValidator,
            },
            resolve: {
                processor: 'mergeDeep',
            },
        },
    };

    const exConfig = new ExConfig(options);

    const result: Lifecycles = exConfig.load(config, dirname);

    return result;
}

export { transformConfig };
