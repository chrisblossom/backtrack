'use strict';

module.exports = {
	presets: [
		[
			'@backtrack/node',
			{ mode: 'module', syntax: 'typescript' },
		],
	],

	packageJson: {
		files: [
			'dist/',
			'paths.js',
		],
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

		eslint: {
			rules: {
				'jest/prefer-inline-snapshots': 'off',
			},
			overrides: [
				{
					files: ['./paths.js'],
					rules: {
						'import/no-unresolved': 'off',
					},
				},
				{
					files: [
						'*.{ts,tsx}',
						'.*.{ts,tsx}',
					],
					rules: {
						// TODO: enable
						'@typescript-eslint/explicit-function-return-type':
							'off',
						'@typescript-eslint/no-explicit-any': 'off',
						'@typescript-eslint/promise-function-async': 'off',
						'@typescript-eslint/restrict-plus-operands': 'off',
						'@typescript-eslint/explicit-member-accessibility':
							'off',
						'@typescript-eslint/camelcase': 'off',
						'import/no-anonymous-default-export': 'off',
						'@typescript-eslint/no-require-imports': 'off',
						'promise/prefer-await-to-callbacks': 'off',
						'promise/prefer-await-to-then': 'off',
						'@typescript-eslint/no-floating-promises': 'off',
						'@typescript-eslint/no-var-requires': 'off',

						'@typescript-eslint/strict-boolean-expressions': [
							'off',
							// {
							// 	allowNullable: true,
							// 	allowSafe: true,
							// 	ignoreRhs: true,
							// },
						],
						'@typescript-eslint/no-throw-literal': 'off',
						'@typescript-eslint/no-unsafe-assignment': 'off',
						'jest/no-export': 'off',
					},
				},
			],
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
