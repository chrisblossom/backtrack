import { groupCustomConfigs } from './group-custom-configs';
import { mergeCustomConfigs } from './merge-custom-configs';

export type ConfigManager = Readonly<{
	config?: any;
	namespace?: string;
}>;

function configManager({ config, namespace }: ConfigManager = {}) {
	/**
	 * Validate args
	 */
	if (typeof namespace !== 'string' || namespace.length === 0) {
		throw new Error('namespace is required');
	}

	const backtrackConfigArray =
		// @ts-ignore
		this.config !== undefined ? this.config.config : undefined;

	/**
	 * Return config if backtrackConfig is not set
	 */
	if (!backtrackConfigArray) {
		return config;
	}

	/**
	 * Group all matched config presets together
	 */
	const groupedCustomConfigs = groupCustomConfigs(
		namespace,
		backtrackConfigArray,
	);

	/**
	 * If no custom config, return original config
	 */
	if (groupedCustomConfigs.length === 0) {
		return config;
	}

	/**
	 * Merge all custom configs
	 */
	const mergedConfigs = mergeCustomConfigs(
		namespace,
		config,
		groupedCustomConfigs,
	);

	return mergedConfigs;
}

export { configManager };
