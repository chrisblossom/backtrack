import { Preprocessor } from './preprocessor';

describe('preprocessor', () => {
	test('removes previous lifecycles when false found', () => {
		const preprocessor = Preprocessor();

		const config = {
			dev: ['before'],
		};

		const value = {
			dev: false,
			files: [{ allowChanges: false }],
		};

		const result = preprocessor({
			// @ts-ignore
			value,
			// @ts-ignore
			config,
			dirname: __dirname,
		});

		expect(result).toMatchSnapshot();
	});

	test('removes removes lifecycle with no config', () => {
		const preprocessor = Preprocessor();

		const value = {
			dev: false,
			files: [{ allowChanges: false }],
		};

		const result = preprocessor({
			// @ts-ignore
			value,
			dirname: __dirname,
		});

		expect(result).toMatchSnapshot();
	});

	test('removes previous lifecycles but keeps new', () => {
		const preprocessor = Preprocessor();

		const value = {
			dev: [false, 'eslint'],
			files: [{ allowChanges: false }],
		};

		const result = preprocessor({
			// @ts-ignore
			value,
			dirname: __dirname,
		});

		expect(result).toMatchSnapshot();
	});

	test('removes previous lifecycles with no config', () => {
		const preprocessor = Preprocessor();

		const value = {
			dev: [false, 'eslint'],
			files: [{ allowChanges: false }],
		};

		const result = preprocessor({
			// @ts-ignore
			value,
			dirname: __dirname,
		});

		expect(result).toMatchSnapshot();
	});
});
