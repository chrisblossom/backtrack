import path from 'path';

const rawClean = (args?: any) => require('./clean').clean(args);
const cleanParser = (args: any) =>
	require('../options-file/clean-processor').cleanProcessor(args);
const cleanPreprocessor = (args: any) =>
	require('../options-file/clean-preprocessor').cleanPreprocessor(args);

function clean(files: any) {
	const normalized = cleanPreprocessor({ value: files });
	const parsed = cleanParser({ value: normalized });

	return rawClean(parsed);
}

describe('clean', () => {
	const cwd = process.cwd();
	let del = require.requireMock('del');
	let ensureDir = require.requireMock('fs-extra').ensureDir;
	let copy = require.requireMock('fs-extra').copy;

	beforeEach(() => {
		jest.doMock('../utils/log', () => ({
			warn: jest.fn(),
			info: jest.fn(),
			error: jest.fn(),
			success: jest.fn(),
		}));

		jest.doMock('del', () =>
			jest.fn((pattern, options = {}) => {
				const delActual = require.requireActual('del');

				return delActual(pattern, {
					...options,
					dryRun: true,
				});
			}),
		);

		del = require.requireMock('del');

		jest.doMock('fs-extra', () => ({
			ensureDir: jest.fn(() => Promise.resolve()),
			copy: jest.fn(() => Promise.resolve()),
		}));

		ensureDir = require.requireMock('fs-extra').ensureDir;
		copy = require.requireMock('fs-extra').copy;
	});

	afterEach(() => {
		process.chdir(cwd);
	});

	test('handles undefined', async () => {
		const dir = path.resolve(__dirname, '__sandbox__/1/');
		process.chdir(dir);

		await rawClean();

		expect(del.mock.calls).toMatchSnapshot();
		expect(ensureDir.mock.calls).toEqual([]);
	});

	test('handles one clean', async () => {
		const dir = path.resolve(__dirname, '__sandbox__/1/');
		process.chdir(dir);

		const options = {
			del: ['**/*'],
			makeDirs: ['nested/', 'another_nested/folder'],
			copy: [
				{
					src: 'static',
					dest: 'static',
					hash: true,
				},
			],
		};

		await clean(options);

		expect(del.mock.calls).toMatchSnapshot();
		expect(ensureDir.mock.calls).toMatchSnapshot();
		expect(copy.mock.calls).toMatchSnapshot();
	});

	test('handles multiple clean', async () => {
		const dir = path.resolve(__dirname, '__sandbox__/1/');
		process.chdir(dir);

		const options = [
			{
				del: ['**/*', '!.git'],
				makeDirs: ['nested/', 'another_nested/folder'],
				copy: [
					{
						src: 'static',
						dest: 'static',
						hash: true,
					},
				],
			},
			{
				del: ['!two.js'],
			},
			{
				makeDirs: ['another_two_nested/folder'],
			},
			{
				copy: [
					{
						src: 'outside-build.js',
						dest: 'static/outside-build.js',
					},
				],
			},
		];

		const normalized = cleanPreprocessor({ value: options });
		const parsed = cleanParser({ value: normalized });

		await clean(parsed);

		expect(del.mock.calls).toMatchSnapshot();
		expect(ensureDir.mock.calls).toMatchSnapshot();
		expect(copy.mock.calls).toMatchSnapshot();
	});

	test('handles empty del', async () => {
		const dir = path.resolve(__dirname, '__sandbox__/1/');
		process.chdir(dir);

		const options = [
			{
				makeDirs: ['nested/', 'another_nested/folder'],
			},
		];

		await clean(options);

		expect(del.mock.calls).toMatchSnapshot();
		expect(ensureDir.mock.calls).toMatchSnapshot();
	});

	test('handles empty makeDirs', async () => {
		const dir = path.resolve(__dirname, '__sandbox__/1/');
		process.chdir(dir);

		const options = [
			{
				del: ['**/*'],
			},
		];

		await clean(options);

		expect(del.mock.calls).toMatchSnapshot();
		expect(ensureDir.mock.calls).toEqual([]);
	});

	test('merges duplicates in correct order', async () => {
		const dir = path.resolve(__dirname, '__sandbox__/1/');
		process.chdir(dir);

		const options = [
			{
				del: ['duplicate/file', 'unique/file', 'duplicate/file'],
				makeDirs: ['duplicate/dir', 'unique/dir', 'duplicate/dir'],
			},
		];

		await clean(options);

		expect(del.mock.calls).toMatchSnapshot();
		expect(ensureDir.mock.calls).toMatchSnapshot();
	});
});
