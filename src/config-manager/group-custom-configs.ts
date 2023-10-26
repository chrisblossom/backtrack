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

		// eslint-disable-next-line @typescript-eslint/no-unsafe-return
		return [
			...acc,
			matched,
		];
	}, []);

	return result;
}

export { groupCustomConfigs };
