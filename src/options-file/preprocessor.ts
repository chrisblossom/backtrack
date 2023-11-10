import readPkgUp from 'read-pkg-up';
import type { AllTaskTypes, BacktrackConfig, Lifecycles } from '../types';

interface Args {
	value: BacktrackConfig;
	dirname: string;
}

function Preprocessor(): (args: Args) => Lifecycles {
	let baseConfig = true;
	const blacklist: string[] = [];

	/**
	 * The preprocessor is ran up up the chain on each preset
	 * After all tasks are processed starting from the top of the preset chain
	 */
	return function preprocessor({ value, dirname }: Args): Lifecycles {
		const lifeCycleKeys: (keyof BacktrackConfig)[] = Object.keys(value);
		const filtered: Lifecycles = lifeCycleKeys.reduce((acc, lifecycle) => {
			let task = value[lifecycle];

			/**
			 * Handle extended tasks
			 * eg, build: [false, 'eslint .']
			 */
			let skipTask = false;
			if (Array.isArray(task)) {
				type TaskAcc2 = (AllTaskTypes | AllTaskTypes[])[];
				task = task.reduceRight(
					(
						acc2: TaskAcc2,
						currentTask: AllTaskTypes | AllTaskTypes[] | false,
					): TaskAcc2 => {
						if (skipTask) {
							return acc2;
						}

						if (!currentTask) {
							skipTask = true;
							return acc2;
						}

						return [
							currentTask,
							...acc2,
						];
					},
					[],
				);
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

			/**
			 * If task is an array with only one item, remove the array
			 */
			task = Array.isArray(task) && task.length === 1 ? task[0] : task;

			return {
				...acc,
				[lifecycle]: task,
			};
		}, {});

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
