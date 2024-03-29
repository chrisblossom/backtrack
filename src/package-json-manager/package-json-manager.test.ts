import path from 'path';
import type { packageJsonManager as packageJsonManagerType } from './package-json-manager';

type PackageJsonManager = typeof packageJsonManagerType;
const packageJsonManager = async (
	presets?: any,
	previousManagedKeys?: any,
): ReturnType<PackageJsonManager> =>
	require('./package-json-manager').packageJsonManager(
		presets,
		previousManagedKeys,
	);

describe('packageJsonManager', () => {
	const cwd = process.cwd();
	let writeFile: any;

	beforeEach(() => {
		jest.mock('../utils/log', () => ({
			warn: jest.fn(),
			info: jest.fn(),
			error: jest.fn(),
			success: jest.fn(),
		}));

		writeFile = jest.requireMock('fs-extra').writeFile;
		jest.mock('fs-extra', () => {
			const fsExtra = jest.requireActual('fs-extra');
			return {
				...fsExtra,
				move: jest.fn(async () => Promise.resolve()),
				writeFile: jest.fn(async () => Promise.resolve()),
			};
		});

		/**
		 * Before calling '.toMatchSnapshot();' snapshot, call 'writeFile.mockRestore();'
		 * otherwise snapshot will not write
		 */
		// writeFile = jest
		// 	.spyOn(fs, 'writeFile')
		// 	.mockImplementation(() => jest.fn());
	});

	afterEach(() => {
		process.chdir(cwd);
	});

	test('handles undefined', async () => {
		const dir = path.resolve(__dirname, '__sandbox__/package-json-1/');
		process.chdir(dir);

		const result = await packageJsonManager();

		const writeFileCalls = writeFile.mock.calls;

		writeFile.mockRestore();

		expect(writeFileCalls).toEqual([]);
		expect(result).toEqual({});
	});

	test('adds custom scripts when they do not exist prior', async () => {
		const dir = path.resolve(__dirname, '__sandbox__/package-json-1/');
		process.chdir(dir);

		const lifecycles = {
			packageJson: [
				{
					scripts: {
						'lint.fix': 'eslint --fix',
					},
				},
			],
		};

		const result = await packageJsonManager(lifecycles);

		const writeFileCalls = writeFile.mock.calls;

		writeFile.mockRestore();

		expect(writeFileCalls).toMatchSnapshot();
		expect(result).toEqual({ scripts: { 'lint.fix': 'eslint --fix' } });
	});

	test('removes empty npm defaults', async () => {
		const dir = path.resolve(__dirname, '__sandbox__/package-json-1/');
		process.chdir(dir);

		const lifecycles = {
			packageJson: [
				{
					license: '',
					scripts: {
						'lint.fix': 'eslint --fix',
						test: null,
					},
				},
			],
		};

		const result = await packageJsonManager(lifecycles);

		const writeFileCalls = writeFile.mock.calls;

		writeFile.mockRestore();

		expect(writeFileCalls).toMatchSnapshot();
		expect(result).toEqual({
			license: '',
			scripts: {
				test: null,
				'lint.fix': 'eslint --fix',
			},
		});
	});

	test('setting null does not always update packageJson if already removed', async () => {
		const dir = path.resolve(__dirname, '__sandbox__/package-json-6/');
		process.chdir(dir);

		const lifecycles = {
			packageJson: [
				{
					scripts: {
						test: null,
					},
				},
			],
		};

		const result = await packageJsonManager(lifecycles);

		const writeFileCalls = writeFile.mock.calls;

		writeFile.mockRestore();

		expect(writeFileCalls).toMatchSnapshot();
		expect(result).toEqual({ scripts: { test: null } });
	});
});
