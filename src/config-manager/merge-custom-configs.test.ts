import type { ExternalConfig } from '../types';

const mergeCustomConfigs = (namespace: any, config: any, customConfigs: any) =>
	require('./merge-custom-configs').mergeCustomConfigs(
		namespace,
		config,
		customConfigs,
	);

const namespace = 'merge_custom_configs_test';

describe('mergeCustomConfigs', () => {
	test('merges objects', () => {
		const config = { extends: ['airbnb-base'] };

		const customConfigs: ExternalConfig = {
			[namespace]: [
				{ extends: ['other-custom-preset'] },
				{ rules: { semi: 'always' } },
				{ rules: { semi: 'never' } },
			],
		};

		const result = mergeCustomConfigs(namespace, config, customConfigs);

		expect(result).toEqual({
			extends: [
				'airbnb-base',
				'other-custom-preset',
			],
			rules: { semi: 'always' },
		});
	});

	test('handles custom merge function', () => {
		const config = {
			extends: ['airbnb-base'],
			rules: {
				semi: 'never',
				'no-undef': 'error',
			},
		};

		const customConfigs: ExternalConfig = {
			[namespace]: [
				(cfg: any) => {
					return {
						...cfg,
						rules: {
							...cfg.rules,
							semi: 'always',
						},
					};
				},
			],
		};

		const result = mergeCustomConfigs(namespace, config, customConfigs);

		expect(result).toEqual({
			extends: ['airbnb-base'],
			rules: { semi: 'always', 'no-undef': 'error' },
		});
	});

	test('handles mixed object and custom merge function', () => {
		const config = {
			extends: ['airbnb-base'],
			rules: {
				semi: 'never',
				'no-undef': 'error',
			},
		};

		const customConfigs: ExternalConfig = {
			[namespace]: [
				(cfg: any) => {
					return {
						...cfg,
						rules: {
							...cfg.rules,
							semi: 'always',
						},
					};
				},
				{
					rules: {
						semi: 'never',
						'no-undef': 'off',
					},
				},
			],
		};

		const result = mergeCustomConfigs(namespace, config, customConfigs);

		expect(result).toEqual({
			extends: ['airbnb-base'],
			rules: { semi: 'always', 'no-undef': 'off' },
		});
	});

	test('merges arrays', () => {
		const config = ['one'];
		const customConfigs: ExternalConfig = {
			[namespace]: [
				[
					'two',
					'three',
				],
			],
		};

		const result = mergeCustomConfigs(namespace, config, customConfigs);

		expect(result).toEqual([
			'one',
			'two',
			'three',
		]);
	});

	test('handles string', () => {
		const config = '1';
		const customConfigs: ExternalConfig = { [namespace]: ['2'] };

		const result = mergeCustomConfigs(namespace, config, customConfigs);

		expect(result).toEqual('2');
	});

	test('handles numbers', () => {
		const config = 1;

		const customConfigs: ExternalConfig = {
			[namespace]: [
				2,
				3,
			],
		};

		const result = mergeCustomConfigs(namespace, config, customConfigs);

		expect(result).toEqual(2);
	});

	test('finds invalid preset', () => {
		const config = {};
		const customConfigs: ExternalConfig = {
			[namespace]: [[]],
		};

		let error;
		try {
			mergeCustomConfigs(namespace, config, customConfigs);
		} catch (e) {
			error = e;
		} finally {
			expect(error).toMatchInlineSnapshot(
				`[Error: merge_custom_configs_test config failed because of mismatched type. Expected: 'plain object', Actual: 'array']`,
			);
		}
	});

	test('finds invalid preset function', () => {
		const config = {};
		const customConfigs: ExternalConfig = { [namespace]: [() => ''] };

		let error;
		try {
			mergeCustomConfigs(namespace, config, customConfigs);
		} catch (e) {
			error = e;
		} finally {
			expect(error).toMatchInlineSnapshot(
				`[Error: merge_custom_configs_test config failed because of mismatched type. Expected: 'plain object', Actual: 'string']`,
			);
		}
	});

	test('is valid with spread', () => {
		const config = {};

		const customConfigs: ExternalConfig = {
			[namespace]: [
				(cfg: any) => ({
					...cfg,
					rules: {
						...cfg.rules,
					},
				}),
			],
		};

		const result = mergeCustomConfigs(namespace, config, customConfigs);

		expect(result).toEqual({ rules: {} });
	});

	test('catches thrown errors', () => {
		const config = {};
		const customConfigs: ExternalConfig = {
			[namespace]: [
				(): void => {
					throw new Error('broken fn');
				},
			],
		};

		let error;
		try {
			mergeCustomConfigs(namespace, config, customConfigs);
		} catch (e) {
			error = e;
		} finally {
			expect(error).toMatchInlineSnapshot(`
[Error: broken fn
config namespace context: merge_custom_configs_test]
`);
		}
	});
});

// Use an empty export to please Babel's single file emit.
// https://github.com/Microsoft/TypeScript/issues/15230
export {};
