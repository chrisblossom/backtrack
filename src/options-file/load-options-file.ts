import { cosmiconfigSync } from 'cosmiconfig';
import { ErrorWithProcessExitCode } from '../utils/error-with-process-exit-code';
import { rootPath } from '../config/paths';
import { Preset } from '../types';

interface ESModule {
	__esModule: true;
	default?: Preset;
}

function isESModule(obj: any): obj is ESModule {
	// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
	return obj.__esModule === true;
}

interface TransformResult {
	config: Preset | ESModule;
	filepath: string;
}

function transform(result: TransformResult | null) {
	/**
	 * Handle missing config file
	 *
	 * TODO: ask to create default backtrack config file with found presets in package.json
	 */
	if (result === null) {
		const message = 'backtrack config not found';
		const exitCode = 1;
		throw new ErrorWithProcessExitCode(message, exitCode);
	}

	let config = result.config;

	/**
	 * Handle ES Modules
	 */
	if (isESModule(config)) {
		if (config.default) {
			config = config.default;
		} else {
			const message = `${result.filepath} must use default export with ES Modules`;
			const exitCode = 1;
			throw new ErrorWithProcessExitCode(message, exitCode);
		}
	}

	return {
		...result,
		config,
	};
}

const explorer = cosmiconfigSync('backtrack', {
	stopDir: rootPath,
	transform,
});

function loadOptionsFile(searchPath: string = rootPath): Preset {
	const result = explorer.search(searchPath);

	const config: Preset = result?.config;

	return config;
}

export { loadOptionsFile };
