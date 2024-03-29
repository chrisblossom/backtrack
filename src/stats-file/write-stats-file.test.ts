import path from 'path';
import type { writeStatsFile as WriteStatsFileType } from './write-stats-file';

type WriteStatsFile = typeof WriteStatsFileType;
const writeStatsFile = async (
	...args: Parameters<WriteStatsFile>
): ReturnType<WriteStatsFile> =>
	require('./write-stats-file').writeStatsFile(...args);

describe('writeStatsFile', () => {
	const cwd = process.cwd();
	let writeFile: any;
	let del: any;

	beforeEach(() => {
		del = jest.requireMock('del');

		jest.mock('del', () => jest.fn(async () => Promise.resolve()));

		jest.mock('../utils/log', () => ({
			warn: jest.fn(),
			info: jest.fn(),
			error: jest.fn(),
			success: jest.fn(),
		}));

		/**
		 * Before calling '.toMatchSnapshot();' snapshot, call 'writeFile.mockRestore();'
		 * otherwise snapshot will not write
		 */
		writeFile = jest.requireMock('fs-extra').writeFile;
		jest.mock('fs-extra', () => {
			const fsExtra = jest.requireActual('fs-extra');
			return {
				...fsExtra,
				writeFile: jest.fn(async () => Promise.resolve()),
			};
		});
	});

	afterEach(() => {
		process.chdir(cwd);
	});

	test('writes stats file', async () => {
		const dir = path.resolve(__dirname, '__sandbox__/stats1/');
		process.chdir(dir);

		const sections = {
			fileManager: {
				directories: [
					path.normalize('dist'),
					path.normalize('nested/one'),
					path.normalize('src'),
				],
				files: {
					[path.normalize('.eslintrc.js')]:
						'059a0b7f26dc50ebe483a7eee4534bfd08d0c5816113e3b0b10782e8ab57ec57',
					[path.normalize('nested/file1.js')]:
						'8b6fd065dc80e6386779fb0188ecfc77fcf4f00fc7f2be965b3035d1577f6347',
					[path.normalize('nested/one/file2.js')]:
						'6e1878e518fe0e6d4d5445ec84694c99df98b1503eb5c5e91bbd70d0c21114bd',
				},
			},
			packageJson: {
				scripts: {
					clean: 'backtrack clean',
					dev: 'backtrack dev --development',
				},
			},
		};

		await writeStatsFile(sections);

		const writeFileMock = writeFile.mock.calls;

		writeFile.mockRestore();

		const fileContents = JSON.parse(writeFileMock[0][1]);

		expect(fileContents).toEqual({
			fileManager: {
				directories: [
					'dist',
					'nested/one',
					'src',
				],
				files: {
					'.eslintrc.js':
						'059a0b7f26dc50ebe483a7eee4534bfd08d0c5816113e3b0b10782e8ab57ec57',
					'nested/file1.js':
						'8b6fd065dc80e6386779fb0188ecfc77fcf4f00fc7f2be965b3035d1577f6347',
					'nested/one/file2.js':
						'6e1878e518fe0e6d4d5445ec84694c99df98b1503eb5c5e91bbd70d0c21114bd',
				},
			},
			packageJson: {
				scripts: {
					clean: 'backtrack clean',
					dev: 'backtrack dev --development',
				},
			},
		});
		expect(writeFileMock).toMatchSnapshot();
		expect(del.mock.calls).toEqual([]);
	});

	test('does not write file if stats have not changed', async () => {
		const dir = path.resolve(__dirname, '__sandbox__/stats1/');
		process.chdir(dir);

		const sections = {
			fileManager: {
				directories: [
					'src',
					'dist',
				],
				files: {
					'.eslintrc.js':
						'059a0b7f26dc50ebe483a7eee4534bfd08d0c5816113e3b0b10782e8ab57ec57',
				},
			},
			packageJson: {
				scripts: {
					dev: 'backtrack dev --development',
				},
			},
		};

		const previousStats = {
			fileManager: {
				directories: [
					'src',
					'dist',
				],
				files: {
					'.eslintrc.js':
						'059a0b7f26dc50ebe483a7eee4534bfd08d0c5816113e3b0b10782e8ab57ec57',
				},
			},
			packageJson: {
				scripts: {
					dev: 'backtrack dev --development',
				},
			},
		};

		await writeStatsFile(sections, previousStats);

		const readFileMock = writeFile.mock.calls;

		writeFile.mockRestore();

		expect(readFileMock).toEqual([]);
		expect(del.mock.calls).toEqual([]);
	});

	test('removes stats file when empty', async () => {
		const dir = path.resolve(__dirname, '__sandbox__/stats1/');
		process.chdir(dir);

		await writeStatsFile({});

		const readFileMock = writeFile.mock.calls;

		writeFile.mockRestore();

		expect(readFileMock).toEqual([]);
		expect(del.mock.calls).toEqual([
			[path.resolve(dir, '.backtrack-stats.json')],
		]);
	});

	test('when all sub keys are empty', async () => {
		const dir = path.resolve(__dirname, '__sandbox__/stats1/');
		process.chdir(dir);

		await writeStatsFile({
			fileManager: {},
			packageJson: {},
		});

		const readFileMock = writeFile.mock.calls;

		writeFile.mockRestore();

		expect(readFileMock).toEqual([]);
		expect(del.mock.calls).toEqual([
			[path.resolve(dir, '.backtrack-stats.json')],
		]);
	});

	test('removes empty sections', async () => {
		const dir = path.resolve(__dirname, '__sandbox__/stats1/');
		process.chdir(dir);

		await writeStatsFile({
			fileManager: {},
			packageJson: {
				scripts: {
					dev: 'backtrack dev --development',
				},
			},
		});

		const readFileMock = writeFile.mock.calls;

		writeFile.mockRestore();

		expect(readFileMock).toMatchSnapshot();
		expect(del.mock.calls).toEqual([]);
	});

	test('do nothing if empty and does not exist', async () => {
		const dir = path.resolve(__dirname, '__sandbox__/stats-missing-file/');
		process.chdir(dir);

		await writeStatsFile({});

		const readFileMock = writeFile.mock.calls;

		writeFile.mockRestore();

		expect(readFileMock).toEqual([]);
		expect(del.mock.calls).toEqual([]);
	});
});
