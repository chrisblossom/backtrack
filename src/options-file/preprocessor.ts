import readPkgUp from 'read-pkg-up';
import { toArray } from '../utils/object-utils';
import type { AllTaskTypes, BacktrackConfig, Lifecycles } from '../types';

interface Args {
	value: BacktrackConfig;
	dirname: string;
}

function Preprocessor(): (args: Args) => Lifecycles {
	let baseConfig = true;
	const blacklist: string[] = [];

	function processTask(
		task: AllTaskTypes | AllTaskTypes[] | false,
		lifecycle: keyof BacktrackConfig,
	): AllTaskTypes | AllTaskTypes[] | false {
		let skipTask = false;

		if (Array.isArray(task)) {
			task = task.reduceRight((acc, currentTask) => {
				if (skipTask) {
					return acc;
				}

				if (!currentTask) {
					skipTask = true;
					return acc;
				}

				return [
					currentTask,
					...acc,
				];
			}, []);
		}

		if (blacklist.includes(lifecycle)) {
			return false;
		}

		if (task === false || skipTask) {
			blacklist.push(lifecycle);
			return task === false ? false : task;
		}

		return task;
	}

	function processConfig(
		task: AllTaskTypes | AllTaskTypes[] | false,
		lifecycle: keyof BacktrackConfig,
	): AllTaskTypes | AllTaskTypes[] {
		if (lifecycle === 'config') {
			return Array.isArray(task) && task.length === 1 ? task[0] : task;
		}
		return toArray(task);
	}

	function addPackageResolution(
		filtered: Lifecycles,
		dirname: string,
	): Lifecycles {
		if (!baseConfig && dirname) {
			const findPackageJson = readPkgUp.sync({
				cwd: dirname,
				normalize: false,
			});
			const closestPackageJson = findPackageJson
				? findPackageJson.packageJson
				: {};
			const packageId = closestPackageJson.name;

			if (packageId) {
				filtered.resolve = { [packageId]: dirname };
			}
		}

		return filtered;
	}

	return function preprocessor({ value, dirname }: Args): Lifecycles {
		const lifeCycleKeys: (keyof BacktrackConfig)[] = Object.keys(value);
		let filtered: Lifecycles = {};

		for (const lifecycle of lifeCycleKeys) {
			let task = value[lifecycle];
			task = processTask(task, lifecycle);

			if (task !== false) {
				task = processConfig(task, lifecycle);
				filtered = { ...filtered, [lifecycle]: task };
			}
		}

		filtered = addPackageResolution(filtered, dirname);

		if (baseConfig) {
			baseConfig = false;
		}

		return filtered;
	};
}

export { Preprocessor };
