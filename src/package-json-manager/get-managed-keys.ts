import { merge } from 'lodash';
import { Lifecycles, PackageJson } from '../types';

const customScripts = {
	dev: 'backtrack dev --development',
	build: 'backtrack build --production',

	// 'dev.prod': 'backtrack dev --production',
	// 'build.dev': 'backtrack build --development',
};

function getManagedKeys(lifecycles: Lifecycles = {}): PackageJson {
	const { packageJson = [] } = lifecycles;

	const getScripts = Object.keys(lifecycles).reduce(
		(acc, currentLifecycle) => {
			/**
			 * Remove internally managed tasks
			 */
			if (
				['packageJson', 'config', 'files', 'resolve'].includes(
					currentLifecycle,
				)
			) {
				return acc;
			}

			const script = lifecycles[currentLifecycle];

			/**
			 * Remove unused lifecycles
			 */
			if (!script || (Array.isArray(script) && script.length === 0)) {
				return acc;
			}

			/**
			 * call backtrack LIFECYCLE unless modified
			 */
			const matched =
				// @ts-ignore
				customScripts[currentLifecycle] ||
				`backtrack ${currentLifecycle}`;

			return { ...acc, [currentLifecycle]: matched };
		},
		{},
	);

	const scripts =
		Object.keys(getScripts).length !== 0 ? { scripts: getScripts } : {};

	// @ts-ignore
	const mergePackageJson = merge(...packageJson);

	const mergedKeys: PackageJson = merge(scripts, mergePackageJson);

	return mergedKeys;
}

export { getManagedKeys };
