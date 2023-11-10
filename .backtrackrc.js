'use strict';

/** @type {import('@backtrack/core').Config} */
const config = {
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
						'@typescript-eslint/no-var-requires': 'off',
						'promise/prefer-await-to-then': 'off',

						'@typescript-eslint/strict-boolean-expressions': [
							'off',
							// {
							// 	allowNullable: true,
							// 	allowSafe: true,
							// 	ignoreRhs: true,
							// },
						],
						'jest/no-export': 'off',

						'@typescript-eslint/explicit-module-boundary-types': [
							'error',
						],
						'@typescript-eslint/explicit-function-return-type': [
							'error',
						],
						'@typescript-eslint/no-unnecessary-condition': 'off',
					},
				},
				{
					files: [
						'*.test.{ts,tsx}',
					],
					rules: {
						'@typescript-eslint/no-explicit-any': 'off',
						'@typescript-eslint/no-unsafe-argument': 'off',
						'@typescript-eslint/no-unsafe-assignment': 'off',
						'@typescript-eslint/ban-ts-comment': 'off',
						'@typescript-eslint/explicit-function-return-type':
							'off',
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

		/**
		 * Jest v29 does not support prettier v3.
		 *
		 * Remove this when Jest v30 is released.
		 *
		 * https://jestjs.io/docs/configuration/#prettierpath-string
		 */
		jest: {
			prettierPath: null,
		},
	},
};

module.exports = config;
