import path from 'path';

const filesValidator = (args: any) =>
	require('./files-validator').filesValidator(args);

describe('filesValidator', () => {
	const cwd = process.cwd();

	afterEach(() => {
		process.chdir(cwd);
	});

	test('handles success', () => {
		const dir = path.resolve(
			__dirname,
			'../file-manager/__sandbox__/stats1/',
		);
		process.chdir(dir);

		const value = [
			{
				src: path.resolve(dir, 'file1.js'),
				dest: 'one.js',
			},
			{
				src: path.resolve(dir, 'random.js'),
				dest: 'three.js',
			},
		];

		const result = filesValidator({ value });

		expect(result).toEqual(undefined);
	});

	test('handles src outside of rootPath', () => {
		const dir = path.resolve(
			__dirname,
			'../file-manager/__sandbox__/stats1/',
		);
		process.chdir(dir);

		const value = [
			{
				src: path.resolve(
					__dirname,
					'../file-manager/__sandbox__/stats2/file1.js',
				),
				dest: 'one.js',
			},
		];

		const result = filesValidator({ value });

		expect(result).toEqual(undefined);
	});

	test('handles dest outside of rootPath', () => {
		const dir = path.resolve(
			__dirname,
			'../file-manager/__sandbox__/stats1/',
		);
		process.chdir(dir);

		const value = [
			{
				src: path.resolve(dir, 'file1.js'),
				dest: '../one.js',
			},
		];

		try {
			expect.hasAssertions();
			filesValidator({ value });
		} catch (error) {
			expect(error).toMatchSnapshot();
		}
	});

	test('handles duplicate dest', () => {
		const dir = path.resolve(
			__dirname,
			'../file-manager/__sandbox__/stats1/',
		);
		process.chdir(dir);

		const value = [
			{
				src: 'one.js',
				dest: 'two.js',
			},
			{
				src: 'three.js',
				dest: 'two.js',
			},
		];

		try {
			expect.hasAssertions();
			filesValidator({ value });
		} catch (error) {
			expect(error).toMatchSnapshot();
		}
	});

	test('handles missing source files', () => {
		const dir = path.resolve(
			__dirname,
			'../file-manager/__sandbox__/stats-missing-file/',
		);
		process.chdir(dir);

		const value = [
			{
				src: path.resolve(dir, 'one.js'),
				dest: 'two.js',
			},
		];

		try {
			expect.hasAssertions();
			filesValidator({ value });
		} catch (error) {
			expect(error).toMatchSnapshot();
		}
	});

	test('handles relative src', () => {
		const dir = path.resolve(
			__dirname,
			'../file-manager/__sandbox__/stats1/',
		);
		process.chdir(dir);

		const value = [
			{
				src: './__sandbox__/stats1/file1.js',
				dest: 'two.js',
			},
		];

		try {
			expect.hasAssertions();
			filesValidator({ value });
		} catch (error) {
			expect(error).toMatchSnapshot();
		}
	});

	test('handles absolute dest', () => {
		const dir = path.resolve(
			__dirname,
			'../file-manager/__sandbox__/stats1/',
		);
		process.chdir(dir);

		const value = [
			{
				src: path.resolve(dir, 'file1.js'),
				dest: path.resolve(dir, 'file1.js'),
			},
		];

		try {
			expect.hasAssertions();
			filesValidator({ value });
		} catch (error) {
			expect(error).toMatchSnapshot();
		}
	});
});
