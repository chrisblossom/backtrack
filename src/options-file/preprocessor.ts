import readPkgUp from 'read-pkg-up';
import { Preset, Lifecycles } from '../types';

interface Args {
	value: Preset;
	dirname: string;
}

function Preprocessor() {
	let baseConfig = true;
	const blacklist: (string | void)[] = [];

	/**
	 * The preprocessor is ran up up the chain on each preset
	 * After all tasks are processed starting from the top of the preset chain
	 */
	return function preprocessor({ value, dirname }: Args) {
		const filtered: Lifecycles = Object.keys(value).reduce(
			(acc, lifecycle) => {
				let task = value[lifecycle];

				/**
				 * Handle extended tasks
				 * eg, build: [false, 'eslint .']
				 */
				let skipTask = false;
				if (Array.isArray(task)) {
					task = task.reduceRight((acc2, currentTask) => {
						if (skipTask === true) {
							// eslint-disable-next-line @typescript-eslint/no-unsafe-return
							return acc2;
						}

						if (currentTask === false) {
							skipTask = true;
							// eslint-disable-next-line @typescript-eslint/no-unsafe-return
							return acc2;
						}

						// eslint-disable-next-line @typescript-eslint/no-unsafe-return
						return [
							currentTask,
							...acc2,
						];
					}, []);
				}

				/**
				 * If blacklisted, skip task
				 */
				if (blacklist.includes(lifecycle)) {
					return acc;
				}

				if (task === false || skipTask !== false) {
					blacklist.push(lifecycle);

					if (task === false) {
						return acc;
					}
				}

				return {
					...acc,
					[lifecycle]: task,
				};
			},
			{},
		);

		if (baseConfig === false && dirname) {
			// Disable normalize as it takes a lot of time and we do not need it
			const findPackageJson = readPkgUp.sync({
				cwd: dirname,
				normalize: false,
			});

			const closestPackageJson = findPackageJson
				? findPackageJson.package
				: {};

			const packageId = closestPackageJson.name;
			if (packageId) {
				filtered.resolve = {
					[packageId]: dirname,
				};
			}
		}

		/**
		 * Preprocessor runs on every preset. Only add files to base preset
		 */
		if (baseConfig === true) {
			baseConfig = false;
		}

		return filtered;
	};
}

export { Preprocessor };
