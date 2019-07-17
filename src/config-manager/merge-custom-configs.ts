import { getType } from '../utils/get-type';
import { mergeDeep } from '../utils/object-utils';

function mergeCustomConfigs(
	namespace: string,
	config: any,
	customConfigs: ReadonlyArray<any>,
) {
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
			} catch (error) {
				error.message +=
					// eslint-disable-next-line no-useless-concat
					'\n' + `config namespace context: ${namespace}`;

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
				return [...acc, ...currentConfig];
			}

			return mergeDeep(acc, currentConfig);
		}

		return currentConfig;
	}, config);

	return result;
}

export { mergeCustomConfigs };
