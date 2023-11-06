/* eslint-disable @typescript-eslint/no-unsafe-return */

import type { Config } from '../types';
import { getType } from '../utils/get-type';
import { mergeDeep } from '../utils/object-utils';

function mergeCustomConfigs(
	namespace: string,
	config: Config,
	customConfigs: Config[],
): Record<string, unknown> {
	const expectedType = getType(config);
	/**
	 * Use reduce right because preset's array order
	 */
	const result = customConfigs.reduceRight((acc, currentConfig) => {
		/**
		 * Allow custom merge functions to be more explicit how
		 */
		if (typeof currentConfig === 'function') {
			let fnResult;

			try {
				fnResult = currentConfig(acc);
			} catch (e: unknown) {
				const error = e as Error;

				error.message += '\n';
				error.message += `config namespace context: ${namespace}`;

				throw error;
			}
			const currentConfigType = getType(fnResult);

			if (currentConfigType !== expectedType) {
				throw new Error(
					`${namespace} config failed with custom function. Mismatched type. Expected: '${expectedType}', Actual: '${currentConfigType}'`,
				);
			}

			return fnResult;
		}

		const currentConfigType = getType(currentConfig);

		if (currentConfigType !== expectedType) {
			throw new Error(
				`${namespace} config failed. Mismatched type. Expected: '${expectedType}', Actual: '${currentConfigType}'`,
			);
		}

		if (typeof currentConfig === 'object' && currentConfig !== null) {
			if (Array.isArray(currentConfig)) {
				return [
					...acc,
					...currentConfig,
				];
			}

			return mergeDeep(acc, currentConfig);
		}

		return currentConfig;
	}, config);

	return result;
}

export { mergeCustomConfigs };
