import type { Initialize } from '../initialize/initialize';
import { mergeCustomConfigs } from './merge-custom-configs';

/**
 * Config manager for third-party configuration files.
 *
 * @param {object} config - Config object
 * @param {string} namespace - Namespace of config
 *
 * @returns {object} - Merged config object
 */
function configManager<T>(
	this: InstanceType<typeof Initialize>,
	{ config: managedConfig, namespace }: { config: T; namespace: string },
): T {
	/**
	 * Validate args
	 */
	if (typeof namespace !== 'string' || namespace.length === 0) {
		throw new Error('namespace is required');
	}

	const thirdPartyOptionsConfig = this.backtrackConfig.config;

	/**
	 * Return config if backtrackConfig is not set
	 */
	if (thirdPartyOptionsConfig == null) {
		return managedConfig;
	}

	/**
	 * If no custom config, return original config
	 */
	const matchedConfig = thirdPartyOptionsConfig[namespace];
	if (matchedConfig == null || matchedConfig.length === 0) {
		return managedConfig;
	}

	/**
	 * Merge all custom configs
	 */
	const mergedConfigs = mergeCustomConfigs<T>(
		namespace,
		managedConfig,
		thirdPartyOptionsConfig,
	);

	return mergedConfigs;
}

export { configManager };
