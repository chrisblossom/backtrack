const mergeCustomConfigs = (namespace: any, config: any, customConfigs: any) =>
	require('./merge-custom-configs').mergeCustomConfigs(
		namespace,
		config,
		customConfigs,
	);

const namespace = 'merge_custom_configs_test';

describe('mergeCustomConfigs', () => {
	test('merges objects', () => {
		const config = {
			extends: ['airbnb-base'],
		};

		const customConfigs = [
			{
				extends: ['other-custom-preset'],
			},
			{
				rules: {
					semi: 'always',
				},
			},
			{
				rules: {
					semi: 'never',
				},
			},
		];

		const result = mergeCustomConfigs(namespace, config, customConfigs);

		expect(result).toEqual({
			extends: ['airbnb-base', 'other-custom-preset'],
			rules: {
				semi: 'always',
			},
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

		const customConfigs = [
			(cfg: any) => {
				return {
					...cfg,
					rules: {
						...cfg.rules,
						semi: 'always',
					},
				};
			},
		];

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

		const customConfigs = [
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
		];

		const result = mergeCustomConfigs(namespace, config, customConfigs);

		expect(result).toEqual({
			extends: ['airbnb-base'],
			rules: { semi: 'always', 'no-undef': 'off' },
		});
	});

	test('merges arrays', () => {
		const config = ['one'];
		const customConfigs = [['two', 'three']];

		const result = mergeCustomConfigs(namespace, config, customConfigs);

		expect(result).toEqual(['one', 'two', 'three']);
	});

	test('handles string', () => {
		const config = '1';

		const customConfigs = ['2'];

		const result = mergeCustomConfigs(namespace, config, customConfigs);

		expect(result).toEqual('2');
	});

	test('handles numbers', () => {
		const config = 1;

		const customConfigs = [2, 3];

		const result = mergeCustomConfigs(namespace, config, customConfigs);

		expect(result).toEqual(2);
	});

	test('finds invalid preset', () => {
		const config = {};

		const customConfigs = [{}, []];

		try {
			expect.hasAssertions();
			mergeCustomConfigs(namespace, config, customConfigs);
		} catch (error) {
			expect(error).toMatchSnapshot();
		}
	});

	test('finds invalid preset function', () => {
		const config = {};

		const customConfigs = [() => ''];

		try {
			expect.hasAssertions();
			mergeCustomConfigs(namespace, config, customConfigs);
		} catch (error) {
			expect(error).toMatchSnapshot();
		}
	});

	test('is valid with spread', () => {
		const config = {};

		const customConfigs = [
			(cfg: any) => ({
				...cfg,
				rules: {
					...cfg.rules,
				},
			}),
		];

		const result = mergeCustomConfigs(namespace, config, customConfigs);

		expect(result).toEqual({ rules: {} });
	});

	test('catches thrown errors', () => {
		const config = {};

		const customConfigs = [
			() => {
				throw new Error('broken fn');
			},
		];

		try {
			expect.hasAssertions();
			mergeCustomConfigs(namespace, config, customConfigs);
		} catch (error) {
			expect(error).toMatchSnapshot();
		}
	});
});

// Use an empty export to please Babel's single file emit.
// https://github.com/Microsoft/TypeScript/issues/15230
export {};
