import { optionsFile } from '../options-file/options-file';
import { loadStatsFile } from '../stats-file/load-stats-file';
import { writeStatsFile } from '../stats-file/write-stats-file';
import { handleError } from '../utils/handle-error';
import { run } from '../run/run';
import { clean } from '../clean/clean';
import { fileManager } from '../file-manager/file-manager';
import { packageJsonManager } from '../package-json-manager/package-json-manager';
import log from '../utils/log';

async function start(options?: Record<string, unknown>): Promise<void> {
	const taskName =
		process.env.RUN_MODE && typeof process.env.RUN_MODE === 'string'
			? process.env.RUN_MODE
			: 'cli-start';

	if (!process.env.NODE_ENV) {
		process.env.NODE_ENV = 'development';
	}

	const NODE_ENV = process.env.NODE_ENV;
	const logPrefix = `${taskName}:${NODE_ENV}`;

	try {
		const lifecycles = optionsFile();
		const statsFile = await loadStatsFile();

		/**
		 * Update package.json
		 */
		const packageJsonStats = await packageJsonManager(
			lifecycles,
			statsFile.packageJson,
		);

		/**
		 * Update all files
		 */
		const filesStats = await fileManager(
			lifecycles.files,
			statsFile.fileManager,
		);

		/**
		 * Write stats file
		 */
		await writeStatsFile(
			{
				fileManager: filesStats,
				packageJson: packageJsonStats,
			},
			statsFile,
		);

		if (
			process.env.RUN_MODE === '--init' ||
			process.env.RUN_MODE === 'init'
		) {
			/**
			 * Run clean script initially
			 */
			if (lifecycles.clean) {
				await clean(lifecycles.clean);
			}

			log.success('backtrack initialized');

			return;
		}

		const matchedTask = lifecycles[taskName];
		if (!matchedTask || matchedTask.length === 0) {
			throw new Error(`${taskName} not found in preset`);
		}

		await run(taskName, matchedTask, options);
	} catch (error) {
		await handleError({
			error: error as Error,
			logPrefix,
		});
	}
}

export { start };
