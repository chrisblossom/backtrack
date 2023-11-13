import path from 'path';
import type { writePackageJson as WritePackageJsonType } from './write-package-json';

type WritePackageJson = typeof WritePackageJsonType;
const writePackageJson = async (
	...args: Parameters<WritePackageJson>
): ReturnType<WritePackageJson> =>
	require('./write-package-json').writePackageJson(...args);

describe('writePackageJson', () => {
	const cwd = process.cwd();
	let writeFile: any;

	beforeEach(() => {
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

	test('writes package json', async () => {
		const dir = path.resolve(__dirname, '__sandbox__/package-json-1/');
		process.chdir(dir);

		const fakePackageJson = {
			scripts: {
				dev: 'run dev',
			},
		};

		const result = await writePackageJson(fakePackageJson);

		const writeFileCalls = writeFile.mock.calls;

		writeFile.mockRestore();

		expect(writeFileCalls).toMatchSnapshot();
		expect(result).toEqual(undefined);
	});
});
