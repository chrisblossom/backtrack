const cleanPreprocessor = (args?: any) =>
	require('./clean-preprocessor').cleanPreprocessor(args);

describe('cleanPreprocessor', () => {
	test('handles undefined', () => {
		const result = cleanPreprocessor();

		expect(result).toEqual([]);
	});

	test('converts all values to arrays and adds missing keys', () => {
		const value = [
			{
				del: '*',
			},
			{
				makeDirs: 'test',
			},
			{
				copy: {
					src: 'static-1',
					dest: 'static-1',
					hash: true,
				},
			},
			{
				copy: {
					src: 'static-2',
					dest: 'static-2',
				},
			},
			{},
			{
				del: '*',
				makeDirs: 'test',
				copy: {
					src: 'static-3',
					dest: 'static-3',
				},
			},
		];

		const result = cleanPreprocessor({ value });

		expect(result).toMatchSnapshot();
	});
});

// Use an empty export to please Babel's single file emit.
// https://github.com/Microsoft/TypeScript/issues/15230
export {};
