'use strict';

module.exports = {
	presets: [['@backtrack/node', { mode: 'module', syntax: 'typescript' }]],

	packageJson: {
		files: ['dist/', 'paths.js'],
	},

	config: {
		babel: (config) => {
			const presetEnvConfig = config.presets.find((preset) => {
				if (Array.isArray(preset) === false) {
					return false;
				}

				return preset[0].includes('@babel/preset-env');
			});

			presetEnvConfig[1].useBuiltIns = 'usage';
			presetEnvConfig[1].corejs = 3;

			return config;
		},

		wallaby: (config) => {
			config.files = config.files.filter((pattern) => {
				return pattern !== '!**/node_modules/**';
			});

			config.files.push('!node_modules/**');

			return config;
		},
	},
};
