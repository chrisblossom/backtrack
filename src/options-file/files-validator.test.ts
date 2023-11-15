import path from 'path';
import type { filesValidator as FilesValidatorType } from './files-validator';

type FilesValidator = typeof FilesValidatorType;
const filesValidator = async (
	...args: Parameters<FilesValidator>
): ReturnType<FilesValidator> =>
	require('./files-validator').filesValidator(...args);

describe('filesValidator', () => {
	const cwd = process.cwd();

	afterEach(() => {
		process.chdir(cwd);
	});

	test('handles success', async () => {
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

		const result = await filesValidator({ value });

		expect(result).toEqual(undefined);
	});

	test('handles src outside of rootPath', async () => {
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

		const result = await filesValidator({ value });

		expect(result).toEqual(undefined);
	});

	test('handles dest outside of rootPath', async () => {
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

		let error;
		try {
			await filesValidator({ value });
		} catch (e) {
			error = e;
		} finally {
			expect(error).toMatchInlineSnapshot(
				`[Error: dest file must be inside rootPath: ../one.js]`,
			);
		}
	});

	test('handles duplicate dest', async () => {
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

		let error;
		try {
			await filesValidator({ value });
		} catch (e) {
			error = e;
		} finally {
			expect(error).toMatchInlineSnapshot(`
[Error: [
  "two.js",
  "two.js" [31m[1][0m
]
[31m
[1] "files destination" contains a duplicate value[0m]
`);
		}
	});

	test('handles missing source files', async () => {
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

		let error;
		try {
			await filesValidator({ value });
		} catch (e) {
			error = e;
		} finally {
			expect(error).toMatchInlineSnapshot(
				`[Error: Source file does not exist: <PROJECT_ROOT>/one.js]`,
			);
		}
	});

	test('handles relative src', async () => {
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

		let error;
		try {
			await filesValidator({ value });
		} catch (e) {
			error = e;
		} finally {
			expect(error).toMatchInlineSnapshot(
				`[Error: source file must be an absolute path: ./__sandbox__/stats1/file1.js]`,
			);
		}
	});

	test('handles absolute dest', async () => {
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

		let error;
		try {
			await filesValidator({ value });
		} catch (e) {
			error = e;
		} finally {
			expect(error).toMatchInlineSnapshot(
				`[Error: Destination file must be a relative path: <PROJECT_ROOT>/file1.js]`,
			);
		}
	});
});
