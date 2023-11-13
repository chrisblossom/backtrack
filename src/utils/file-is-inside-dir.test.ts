import path from 'path';
import type {
	fileIsInsideDir as FileIsInsideDirType,
	fileIsInsideDirSync as FileIsInsideDirSyncType,
} from './file-is-inside-dir';

type FileIsInsideDir = typeof FileIsInsideDirType;
const fileIsInsideDir = async (
	...args: Parameters<FileIsInsideDir>
): ReturnType<FileIsInsideDir> =>
	require('./file-is-inside-dir').fileIsInsideDir(...args);

type FileIsInsideDirSync = typeof FileIsInsideDirSyncType;
const fileIsInsideDirSync = (
	...args: Parameters<FileIsInsideDirSync>
): ReturnType<FileIsInsideDirSync> =>
	require('./file-is-inside-dir').fileIsInsideDirSync(...args);

describe('fileIsInsideDir', () => {
	const cwd = process.cwd();
	const sandboxDir = path.resolve(__dirname, '__sandbox__/');

	beforeEach(() => {
		process.chdir(sandboxDir);
	});

	afterEach(() => {
		process.chdir(cwd);
	});

	test('defaults dir to rootPath', async () => {
		const file = path.resolve(sandboxDir, 'nested/file.js');

		const asyncResult = await fileIsInsideDir(file);
		const syncResult = fileIsInsideDirSync(file);

		const expectedResult = true;
		expect(asyncResult).toEqual(expectedResult);
		expect(syncResult).toEqual(expectedResult);
	});

	test('handles empty file - false', async () => {
		const file = '';
		const asyncResult = await fileIsInsideDir(file);
		const syncResult = fileIsInsideDirSync(file);

		const expectedResult = false;
		expect(asyncResult).toEqual(expectedResult);
		expect(syncResult).toEqual(expectedResult);
	});

	test('handles relative', async () => {
		const file = '../';
		const asyncResult = await fileIsInsideDir(file);
		const syncResult = fileIsInsideDirSync(file);

		const expectedResult = false;
		expect(asyncResult).toEqual(expectedResult);
		expect(syncResult).toEqual(expectedResult);
	});

	test('handles absolute', async () => {
		const file = path.resolve(__dirname, '../');
		const asyncResult = await fileIsInsideDir(file);
		const syncResult = fileIsInsideDirSync(file);

		const expectedResult = false;
		expect(asyncResult).toEqual(expectedResult);
		expect(syncResult).toEqual(expectedResult);
	});

	test('handles explicit dir - true', async () => {
		const file = path.resolve(sandboxDir, 'files1/nested/other1.js');
		const dir = path.resolve(sandboxDir, 'files1/');
		const asyncResult = await fileIsInsideDir(file, dir);
		const syncResult = fileIsInsideDirSync(file, dir);

		const expectedResult = true;
		expect(asyncResult).toEqual(expectedResult);
		expect(syncResult).toEqual(expectedResult);
	});

	test('handles explicit dir - false', async () => {
		const file = path.resolve(sandboxDir, 'files1/nested/other1.js');
		const dir = path.resolve(sandboxDir, 'other_files/');
		const asyncResult = await fileIsInsideDir(file, dir);
		const syncResult = fileIsInsideDirSync(file, dir);

		const expectedResult = false;
		expect(asyncResult).toEqual(expectedResult);
		expect(syncResult).toEqual(expectedResult);
	});

	test('handles explicit relative dir - true', async () => {
		const file = 'files1/nested/other1.js';
		const dir = 'files1/';
		const asyncResult = await fileIsInsideDir(file, dir);
		const syncResult = fileIsInsideDirSync(file, dir);

		const expectedResult = true;
		expect(asyncResult).toEqual(expectedResult);
		expect(syncResult).toEqual(expectedResult);
	});

	test('handles explicit relative dir - false', async () => {
		const file = 'nested/other1.js';
		const dir = 'files1/';
		const asyncResult = await fileIsInsideDir(file, dir);
		const syncResult = fileIsInsideDirSync(file, dir);

		const expectedResult = false;
		expect(asyncResult).toEqual(expectedResult);
		expect(syncResult).toEqual(expectedResult);
	});

	test('handles excess path with same base', async () => {
		const file = path.resolve(sandboxDir, 'files1nested/other1.js');
		const dir = path.resolve(sandboxDir, 'files1');
		const asyncResult = await fileIsInsideDir(file, dir);
		const syncResult = fileIsInsideDirSync(file, dir);

		const expectedResult = false;
		expect(asyncResult).toEqual(expectedResult);
		expect(syncResult).toEqual(expectedResult);
	});
});
