/* eslint-disable @typescript-eslint/no-unsafe-member-access,@typescript-eslint/no-unsafe-return */

import { groupCustomConfigs } from './group-custom-configs';
import { mergeCustomConfigs } from './merge-custom-configs';

export type ConfigManager = Readonly<{
	config?: any;
	namespace?: string;
}>;

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
	this: ConfigManager,
	{ config, namespace }: ConfigManager = {},
): ConfigManagerReturn {
	/**
	 * Validate args
	 */
	if (typeof namespace !== 'string' || namespace.length === 0) {
		throw new Error('namespace is required');
	}

	const backtrackConfigArray =
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
