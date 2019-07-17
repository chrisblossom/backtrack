import { removeNullValues } from './remove-null-values';

describe('removeNullValues', () => {
	test('removes null values', () => {
		const packageJson = {
			version: '1.0.0',
			description: '',
			keywords: [],
			license: null,
			private: true,
			author: '',
			main: 'index.js',
			scripts: {
				test: null,
			},
			devDependencies: {},
			dependencies: {},
		};

		const result = removeNullValues(packageJson);

		expect(result).toEqual({
			version: '1.0.0',
			description: '',
			keywords: [],
			private: true,
			author: '',
			main: 'index.js',
			scripts: {},
			devDependencies: {},
			dependencies: {},
		});
	});
});
