import { Config } from '../types';

function groupCustomConfigs(
	namespace: string,
	customConfigs: readonly Config[],
): readonly unknown[] {
	const result = customConfigs.reduce((acc: string[], config) => {
		const matched = config[namespace];
		if (matched === undefined) {
			return acc;
		}

		return [...acc, matched];
	}, []);

	return result;
}

export { groupCustomConfigs };
