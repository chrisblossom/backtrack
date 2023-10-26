const groupCustomConfigs = (namespace: any, customConfigs: any) =>
	require('./group-custom-configs').groupCustomConfigs(
		namespace,
		customConfigs,
	);

describe('groupCustomConfigs', () => {
	test('gets matched namespace', () => {
		const customConfigs = [
			{
				'config-1': 1,
			},
			{
				'config-2': 2,
			},
			{
				'config-1': 3,
			},
		];

		const result = groupCustomConfigs('config-1', customConfigs);

		expect(result).toEqual([
			1,
			3,
		]);
	});

	test('return empty array when none are matched', () => {
		const customConfigs = [
			{
				'config-1': 1,
			},
			{
				'config-2': 2,
			},
			{
				'config-1': 3,
			},
		];

		const result = groupCustomConfigs('config-3', customConfigs);

		expect(result).toEqual([]);
	});
});

// Use an empty export to please Babel's single file emit.
// https://github.com/Microsoft/TypeScript/issues/15230
export {};
