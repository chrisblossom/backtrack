import { exConfigSync, Options as exConfigOptions } from 'ex-config';
import { rootPath } from '../config/paths';
import { Lifecycles, BacktrackConfig } from '../types';
import { Preprocessor } from './preprocessor';
import { postProcessor } from './post-processor';
import { presetValidator } from './preset-validator';
import { externalConfigProcessor } from './external-config-processor';
import { cleanPreprocessor } from './clean-preprocessor';
import { cleanValidator } from './clean-validator';
import { cleanProcessor } from './clean-processor';
import { filesPreprocessor } from './files-preprocessor';
import { filesValidator } from './files-validator';

function transformConfig(
	config: BacktrackConfig,
	dirname: string = rootPath,
): Lifecycles {
	/**
	 * Needs to be placed inside function for caching reasons
	 */
	const options: exConfigOptions = {
		baseDirectory: dirname,
		preprocessor: Preprocessor(),
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
			config: {
				processor: externalConfigProcessor,
			},
		},
	};

	const result: Lifecycles = exConfigSync(config, options);

	return result;
}

export { transformConfig };
