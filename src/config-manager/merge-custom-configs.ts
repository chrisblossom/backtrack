import type { ExternalConfig } from '../types';
import { getType } from '../utils/get-type';
import { isPlainObject, mergeDeep } from '../utils/object-utils';

function checkType<T>(
	namespace: string,
	value: unknown,
	expectedType: string,
): asserts value is T {
	const currentType = getType(value);
	if (currentType !== expectedType) {
		throw new Error(
			`${namespace} config failed because of mismatched type. Expected: '${expectedType}', Actual: '${currentType}'`,
		);
	}
}

type Fn = <T>(x: T) => T;
function isFunction(fn: unknown): fn is Fn {
	return typeof fn === 'function';
}

function run<T>(namespace: string, fn: Fn, previousConfig: T): T {
	try {
		const fnResult = fn(previousConfig);

		return fnResult;
	} catch (e: unknown) {
		const error = e as Error;

		error.message += '\n';
		error.message += `config namespace context: ${namespace}`;

		throw error;
	}
}

function mergeCustomConfigs<T>(
	namespace: string,
	config: T,
	customConfigs: ExternalConfig,
): T {
	const expectedType = getType(config);
	/**
	 * Use reduce right because preset's array order
	 */

	const result = customConfigs[namespace].reduceRight<T>(
		(acc, currentConfig): T => {
			if (currentConfig == null) {
				return acc;
			}

			/**
			 * Allow custom merge functions to be more explicit how
			 */
			if (isFunction(currentConfig)) {
				const fnResult = run<T>(namespace, currentConfig, acc);
				checkType<T>(namespace, fnResult, expectedType);

				return fnResult;
			}

			checkType<T>(namespace, currentConfig, expectedType);

			if (Array.isArray(currentConfig) && Array.isArray(acc)) {
				return [
					...acc,
					...currentConfig,
				] as T;
			}

			if (isPlainObject(currentConfig) && isPlainObject(acc)) {
				return mergeDeep<T>(acc, currentConfig);
			}

			return currentConfig;
		},
		config,
	);

	return result;
}

export { mergeCustomConfigs };
