import { Config } from '../types';

function groupCustomConfigs(
	namespace: string,
	customConfigs: Config[],
): Config[] {
	const result = customConfigs.reduce((acc: string[], config) => {
		const matched = config[namespace];
		if (matched == null) {
			return acc;
		}

		return [
			...acc,
			matched,
		];
	}, []);

	return result;
}

export { groupCustomConfigs };
