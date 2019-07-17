import { Config } from '../types';

function groupCustomConfigs(
	namespace: string,
	customConfigs: ReadonlyArray<Config>,
): ReadonlyArray<unknown> {
	const result = customConfigs.reduce((acc: Array<string>, config) => {
		const matched = config[namespace];
		if (matched === undefined) {
			return acc;
		}

		return [...acc, matched];
	}, []);

	return result;
}

export { groupCustomConfigs };
