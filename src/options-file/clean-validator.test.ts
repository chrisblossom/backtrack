import path from 'path';
import os from 'os';

const cleanValidator = (args: any) =>
	require('./clean-validator').cleanValidator(args);

const cleanPreprocessor = (args: any) =>
	require('./clean-preprocessor').cleanPreprocessor(args);

function getValue(value: any) {
	return cleanPreprocessor({ value });
}

describe('cleanValidator', () => {
	const cwd = process.cwd();
	const dir = path.resolve(__dirname, '../clean/__sandbox__/1/');

	beforeEach(() => {
		process.chdir(dir);
	});

	afterEach(() => {
		process.chdir(cwd);
	});

	test('del fails with relative ../', () => {
		const value = getValue([
			{
				del: ['../src/**'],
				makeDirs: [],
				copy: [],
			},
		]);

		try {
			expect.hasAssertions();
			cleanValidator({ value });
		} catch (error) {
			expect(error).toMatchSnapshot();
		}
	});

	test('del fails with absolute inside rootPath', () => {
		const value = getValue([
			{
				del: [path.resolve(dir, 'src/**')],
				makeDirs: [],
				copy: [],
			},
		]);

		try {
			expect.hasAssertions();
			cleanValidator({ value });
		} catch (error) {
			expect(error).toMatchSnapshot();
		}
	});

	test('del fails with absolute', () => {
		process.chdir(__dirname);
		const value = getValue([
			{
				del: [path.resolve(__dirname, '__sandbox__/should_fail')],
				makeDirs: [],
				copy: [],
			},
		]);

		try {
			expect.hasAssertions();
			cleanValidator({ value });
		} catch (error) {
			expect(error).toMatchSnapshot();
		}
	});

	test('del fails with absolute + relative', () => {
		process.chdir(__dirname);
		const value = getValue([
			{
				del: [path.resolve(__dirname, '__sandbox__/1/../dist/')],
				makeDirs: [],
				copy: [],
			},
		]);

		try {
			expect.hasAssertions();
			cleanValidator({ value });
		} catch (error) {
			expect(error).toMatchSnapshot();
		}
	});

	test('makeDirs fails when outside build directory', () => {
		process.chdir(__dirname);
		const value = getValue([
			{
				del: [],
				makeDirs: [path.resolve(__dirname, '__sandbox__/1/../dist/')],
				copy: [],
			},
		]);

		try {
			expect.hasAssertions();
			cleanValidator({ value });
		} catch (error) {
			expect(error).toMatchSnapshot();
		}
	});

	test('copy fails when dest outside build directory', () => {
		process.chdir(dir);
		const value = getValue([
			{
				del: [],
				makeDirs: [],
				copy: [
					{
						dest: path.resolve(dir, 'static'),
						src: path.resolve(dir, 'static'),
					},
				],
			},
		]);

		try {
			expect.hasAssertions();
			cleanValidator({ value });
		} catch (error) {
			expect(error).toMatchSnapshot();
		}
	});

	test('copy fails when src outside root directory', () => {
		process.chdir(dir);
		const value = getValue([
			{
				del: [],
				makeDirs: [],
				copy: [
					{
						dest: path.resolve(dir, 'dist/static'),
						src: path.resolve(os.homedir(), 'static'),
					},
				],
			},
		]);

		try {
			expect.hasAssertions();
			cleanValidator({ value });
		} catch (error) {
			expect(error).toMatchSnapshot();
		}
	});

	test('copy fails when src is inside build directory', () => {
		process.chdir(dir);
		const value = getValue([
			{
				del: [],
				makeDirs: [],
				copy: [
					{
						dest: path.resolve(dir, 'dist/static'),
						src: path.resolve(dir, 'dist/static'),
					},
				],
			},
		]);

		try {
			expect.hasAssertions();
			cleanValidator({ value });
		} catch (error) {
			expect(error).toMatchSnapshot();
		}
	});

	test('copy fails when duplicate dest but differing src', () => {
		process.chdir(dir);
		const value = getValue([
			{
				del: [],
				makeDirs: [],
				copy: [
					{
						src: 'static-1',
						dest: 'static',
					},
					{
						src: 'static-2',
						dest: 'static',
					},
				],
			},
		]);

		try {
			expect.hasAssertions();
			cleanValidator({ value });
		} catch (error) {
			expect(error).toMatchSnapshot();
		}
	});

	test('copy fails when duplicate dest/src and mismatched hash: true/false', () => {
		process.chdir(dir);
		const value = getValue([
			{
				del: [],
				makeDirs: [],
				copy: [
					{
						dest: 'static',
						src: 'static',
						hash: true,
					},
					{
						dest: 'static',
						src: 'static',
						hash: false,
					},
				],
			},
		]);

		try {
			expect.hasAssertions();
			cleanValidator({ value });
		} catch (error) {
			expect(error).toMatchSnapshot();
		}
	});

	test('passes with just del', () => {
		const value = getValue([
			{
				del: ['*'],
				makeDirs: [],
				copy: [],
			},
		]);

		const result = cleanValidator({ value });
		expect(result).toEqual(undefined);
	});

	test('passes with del glob', () => {
		const value = getValue([
			{
				del: ['!.git'],
				makeDirs: [],
				copy: [],
			},
		]);

		const result = cleanValidator({ value });
		expect(result).toEqual(undefined);
	});

	test('passes with just makeDirs', () => {
		const value = getValue([
			{
				del: [],
				makeDirs: ['fake/dir/'],
				copy: [],
			},
		]);

		const result = cleanValidator({ value });
		expect(result).toEqual(undefined);
	});

	test('passes with just copy', () => {
		process.chdir(dir);
		const value = getValue([
			{
				del: [],
				makeDirs: [],
				copy: [
					{
						dest: 'static',
						src: 'static',
					},
				],
			},
		]);

		const result = cleanValidator({ value });
		expect(result).toEqual(undefined);
	});
});
