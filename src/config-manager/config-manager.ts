import type { Config } from '../types';
import type { Initialize } from '../initialize/initialize';
import { groupCustomConfigs } from './group-custom-configs';
import { mergeCustomConfigs } from './merge-custom-configs';

export type ConfigManager = Readonly<{
	config?: Config;
	namespace?: string;
}>;

// Should be preset or lifecycles. Worst case Config
export type ConfigManagerReturn = Record<string, unknown>;

/**
 * Config manager
 *
 * @param {object} config - Config object
 * @param {string} namespace - Namespace of config
 *
 * @returns {object} - Merged config object
 */
function configManager(
	this: InstanceType<typeof Initialize>,
	{ config: managedConfig = {}, namespace }: ConfigManager = {},
): ConfigManagerReturn {
	/**
	 * Validate args
	 */
	if (typeof namespace !== 'string' || namespace.length === 0) {
		throw new Error('namespace is required');
	}

	const backtrackConfigArray = this.backtrackConfig.config;

	/**
	 * Return config if backtrackConfig is not set
	 */
	if (backtrackConfigArray == null) {
		return managedConfig;
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
		return managedConfig;
	}

	/**
	 * Merge all custom configs
	 */
	const mergedConfigs = mergeCustomConfigs(
		namespace,
		managedConfig,
		groupedCustomConfigs,
	);

	return mergedConfigs;
}

export { configManager };
