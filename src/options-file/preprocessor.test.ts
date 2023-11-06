import { Preprocessor } from './preprocessor';

describe('preprocessor', () => {
	test('removes previous lifecycles when false found', () => {
		const preprocessor = Preprocessor();

		const config = {
			dev: ['before'],
		};

		const value = {
			dev: false,
			files: [
				{ allowChanges: false },
			],
		};

		const result = preprocessor({
			// @ts-expect-error
			value,
			config,
			dirname: __dirname,
		});

		expect(result).toEqual({
			files: [
				{ allowChanges: false },
			],
		});
	});

	test('removes removes lifecycle with no config', () => {
		const preprocessor = Preprocessor();

		const value = {
			dev: false,
			files: [
				{ allowChanges: false },
			],
		};

		const result = preprocessor({
			// @ts-expect-error
			value,
			dirname: __dirname,
		});

		expect(result).toEqual({
			files: [
				{ allowChanges: false },
			],
		});
	});

	test('removes previous lifecycles but keeps new', () => {
		const preprocessor = Preprocessor();

		const value = {
			dev: [
				false,
				'eslint',
			],
			files: [
				{ allowChanges: false },
			],
		};

		const result = preprocessor({
			// @ts-expect-error
			value,
			dirname: __dirname,
		});

		expect(result).toEqual({
			dev: ['eslint'],
			files: [
				{ allowChanges: false },
			],
		});
	});

	test('removes previous lifecycles with no config', () => {
		const preprocessor = Preprocessor();

		const value = {
			dev: [
				false,
				'eslint',
			],
			files: [
				{ allowChanges: false },
			],
		};

		const result = preprocessor({
			// @ts-expect-error
			value,
			dirname: __dirname,
		});

		expect(result).toEqual({
			dev: ['eslint'],
			files: [
				{ allowChanges: false },
			],
		});
	});

	test('handles concurrent tasks', () => {
		const preprocessor = Preprocessor();

		const value = {
			dev: [
				[
					'task1',
					'task2',
				],
				'task3',
			],
			build: ['task4'],
		};

		const result = preprocessor({
			value,
			dirname: __dirname,
		});

		expect(result).toEqual({
			build: ['task4'],
			dev: [
				[
					'task1',
					'task2',
				],
				'task3',
			],
		});
	});
});
