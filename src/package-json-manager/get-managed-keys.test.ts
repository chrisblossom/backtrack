const getManagedKeys = (lifecycles?: any) =>
	require('./get-managed-keys').getManagedKeys(lifecycles);

describe('getManagedKeys', () => {
	test('handles undefined', () => {
		const result = getManagedKeys();

		expect(result).toEqual({});
	});

	test('handles empty lifecycles', () => {
		const result = getManagedKeys({});

		expect(result).toEqual({});
	});

	test('filters empty presets and removes non-scripts', () => {
		const lifecycles = {
			dev: ['dev'],
			build: ['build'],
			test: ['test'],
			packageJson: [{}],
			config: [{}],
			resolve: {},
		};

		const result = getManagedKeys(lifecycles);

		expect(result).toEqual({
			scripts: {
				dev: 'backtrack dev --development',
				build: 'backtrack build --production',
				test: 'backtrack test',
			},
		});
	});

	test('adds custom packageJson', () => {
		const lifecycles = {
			dev: ['dev'],
			build: ['build'],
			packageJson: [
				{
					scripts: {
						start: 'run',
					},
					'lint-staged': {
						'*.js': ['eslint'],
					},
				},
			],
		};

		const result = getManagedKeys(lifecycles);

		expect(result).toEqual({
			scripts: {
				dev: 'backtrack dev --development',
				build: 'backtrack build --production',
				start: 'run',
			},
			'lint-staged': {
				'*.js': ['eslint'],
			},
		});
	});

	test('merges multiple packageJson together', () => {
		const lifecycles = {
			packageJson: [
				{
					scripts: {
						'lint.fix': 'eslint --fix',
					},
				},
				{
					scripts: {
						'format.fix': 'prettier',
					},
				},
			],
		};

		const result = getManagedKeys(lifecycles);

		expect(result).toEqual({
			scripts: {
				'lint.fix': 'eslint --fix',
				'format.fix': 'prettier',
			},
		});
	});
});

// Use an empty export to please Babel's single file emit.
// https://github.com/Microsoft/TypeScript/issues/15230
export {};
