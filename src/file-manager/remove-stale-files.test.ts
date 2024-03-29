import path from 'path';
import { FileManager } from '../types';
import { fileInfo } from './file-test-utils';
import type { removeStaleFiles as RemoveStaleFilesType } from './remove-stale-files';

type RemoveStaleFiles = typeof RemoveStaleFilesType;
const removeStaleFiles = async (
	...args: Parameters<any>
): ReturnType<RemoveStaleFiles> =>
	require('./remove-stale-files').removeStaleFiles(...args);

describe('removeStaleFiles', () => {
	const cwd = process.cwd();
	let del: any;
	let move: any;

	beforeEach(() => {
		del = jest.requireMock('del');
		jest.mock('del', () => jest.fn(async () => Promise.resolve()));

		move = jest.requireMock('fs-extra').move;
		jest.mock('fs-extra', () => {
			const fsExtra = jest.requireActual('fs-extra');
			return {
				...fsExtra,
				move: jest.fn(async () => Promise.resolve()),
			};
		});

		jest.mock('../utils/log', () => ({
			warn: jest.fn(),
			info: jest.fn(),
			error: jest.fn(),
			success: jest.fn(),
		}));
	});

	afterEach(() => {
		process.chdir(cwd);
	});

	test('does nothing if no stats file', async () => {
		const dir = path.resolve(__dirname, '__sandbox__/stats1/');
		process.chdir(dir);

		const files = [
			{
				src: path.resolve(dir, 'nested/other.js'),
				dest: 'nested/other.js',
			},
		];

		const { parsedFiles, previousStats } = fileInfo(files);

		await removeStaleFiles(parsedFiles, previousStats);

		expect(del.mock.calls).toEqual([]);
		expect(move.mock.calls).toEqual([]);
	});

	test('does nothing if all files matched', async () => {
		const dir = path.resolve(__dirname, '__sandbox__/stats1/');
		process.chdir(dir);

		const previousFiles = [
			{
				src: path.resolve(dir, 'nested/file1.js'),
				dest: 'nested/file1.js',
			},
			{
				src: path.resolve(dir, 'nested/other.js'),
				dest: 'nested/other.js',
			},
		];

		const files = previousFiles;

		const { parsedFiles, previousStats } = fileInfo(files, previousFiles);

		await removeStaleFiles(parsedFiles, previousStats);

		expect(del.mock.calls).toEqual([]);
		expect(move.mock.calls).toEqual([]);
	});

	test('does nothing if files added', async () => {
		const dir = path.resolve(__dirname, '__sandbox__/stats1/');
		process.chdir(dir);

		const previousFiles = [
			{
				src: path.resolve(dir, 'nested/file1.js'),
				dest: 'nested/file1.js',
			},
		];

		const files = [
			{
				src: path.resolve(dir, 'nested/file1.js'),
				dest: 'nested/file1.js',
			},
			{
				src: path.resolve(dir, 'nested/other.js'),
				dest: 'nested/other.js',
			},
		];

		const { parsedFiles, previousStats } = fileInfo(files, previousFiles);

		await removeStaleFiles(parsedFiles, previousStats);

		expect(del.mock.calls).toEqual([]);
		expect(move.mock.calls).toEqual([]);
	});

	test('removes stale files', async () => {
		const dir = path.resolve(__dirname, '__sandbox__/stats1/');
		process.chdir(dir);

		const previousFiles = [
			{
				src: path.resolve(dir, 'nested/file1.js'),
				dest: 'nested/file1.js',
			},
			{
				src: path.resolve(dir, 'nested/inside.js'),
				dest: 'nested/inside.js',
			},
		];

		const files = [
			{
				src: path.resolve(dir, 'nested/file1.js'),
				dest: 'nested/file1.js',
			},
		];

		const { parsedFiles, previousStats } = fileInfo(files, previousFiles);

		await removeStaleFiles(parsedFiles, previousStats);

		expect(del.mock.calls).toMatchSnapshot();
		expect(move.mock.calls).toEqual([]);
	});

	test('backup file if removed and destination hash different', async () => {
		const dir = path.resolve(__dirname, '__sandbox__/stats1/');
		process.chdir(dir);

		const files: FileManager = [];

		const previousStats = {
			'nested/file1.js': 'fake',
		};

		const { parsedFiles } = fileInfo(files);

		await removeStaleFiles(parsedFiles, previousStats);

		expect(move.mock.calls).toMatchSnapshot();
		expect(del.mock.calls).toEqual([]);
	});

	test('allowChanges - removes -latest file when source and dest hash match', async () => {
		const dir = path.resolve(__dirname, '__sandbox__/stats1/');
		process.chdir(dir);

		const previousFiles = [
			{
				src: path.resolve(dir, 'file2.js'),
				dest: 'file2.js',
			},
		];

		const files = previousFiles;

		const { parsedFiles, previousStats } = fileInfo(files, previousFiles);

		await removeStaleFiles(parsedFiles, previousStats);

		expect(del.mock.calls).toMatchSnapshot();
		expect(move.mock.calls).toEqual([]);
	});

	test('allowChanges - removes -latest file when dest is no longer managed', async () => {
		const dir = path.resolve(__dirname, '__sandbox__/stats1/');
		process.chdir(dir);

		const previousFiles = [
			{
				src: path.resolve(dir, 'file2.js'),
				dest: 'file2.js',
			},
		];

		const files: FileManager = [];

		const { parsedFiles, previousStats } = fileInfo(files, previousFiles);

		await removeStaleFiles(parsedFiles, previousStats);

		expect(del.mock.calls).toMatchSnapshot();
		expect(move.mock.calls).toEqual([]);
	});
});
