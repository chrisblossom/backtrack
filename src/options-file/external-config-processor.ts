import type { ExternalConfig } from '../types';

interface Args {
	value: Record<string, unknown>;
	current?: ExternalConfig;
}

function externalConfigProcessor({ current, value }: Args): ExternalConfig {
	const result = Object.entries(value).reduce<ExternalConfig>(
		// prettier-ignore
		(acc, [configNamespace, val]: [string, unknown]) => {
			if (acc[configNamespace] === undefined) {
				acc[configNamespace] = [];
			}

			acc[configNamespace].unshift(val);

			return acc;
		},
		{ ...current },
	);

	return result;
}

export { externalConfigProcessor };
