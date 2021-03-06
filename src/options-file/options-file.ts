import { rootPath } from '../config/paths';
import { Lifecycles } from '../types';
import { loadOptionsFile } from './load-options-file';
import { transformConfig } from './transform-config';

function optionsFile(dirname: string = rootPath): Lifecycles {
	const baseConfig = loadOptionsFile(dirname);

	const config = transformConfig(baseConfig, dirname);

	return config;
}

export { optionsFile };
