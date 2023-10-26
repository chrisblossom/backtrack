import { TempSandbox } from 'temp-sandbox';

const backtrack = () => {
	jest.resetModules();

	return require('../src/cli/start').start();
};

const sandbox = new TempSandbox();
const cwd = process.cwd();
const runMode = process.env.RUN_MODE;
const handleErrorMock = jest.fn();
let processExitSpy: any;

beforeEach(async () => {
	process.chdir(sandbox.dir);
	await sandbox.clean();

	// Suppress all console logging
	jest.spyOn(console, 'info').mockImplementation(() => undefined);
	jest.spyOn(console, 'warn').mockImplementation(() => undefined);
	jest.spyOn(console, 'error').mockImplementation(() => undefined);
	jest.spyOn(console, 'debug').mockImplementation(() => undefined);

	processExitSpy = jest
		.spyOn(process, 'exit')
		// @ts-ignore
		.mockImplementation(() => undefined);

	jest.doMock('../src/utils/handle-error', () => ({
		handleError: (...args: any[]) => {
			handleErrorMock(...args);

			const handleError = jest.requireActual(
				'../src/utils/handle-error',
			).handleError;

			return handleError(...args);
		},
	}));
});

afterEach(() => {
	process.chdir(cwd);
	process.env.RUN_MODE = runMode;
	jest.restoreAllMocks();
});

afterAll(async () => {
	await sandbox.destroySandbox();
});

function getError() {
	const result = handleErrorMock.mock.calls[0][0];

	if (!result.error) {
		return result;
	}

	if (result.error.message) {
		result.message = result.error.message;
	}

	if (result.error.code) {
		result.code = result.error.code;
	}

	delete result.error;

	return result;
}

test('exits when no config found', async () => {
	process.env.RUN_MODE = 'init';

	await backtrack();

	expect(processExitSpy).toHaveBeenCalledWith(1);

	const error = getError();
	expect(error.message).toEqual('backtrack config not found');
});

test('backtrack', async () => {
	process.env.RUN_MODE = 'init';

	const config = {
		clean: {
			del: '**/*',
			copy: [
				{
					src: 'static',
					dest: 'static',
				},
				{
					src: 'static-1/static1-file.js',
					dest: 'static/static1-file.js',
				},
			],
		},
		files: {
			src: 'files/file1.js',
			dest: 'file1.js',
		},
		packageJson: {
			scripts: {
				test: 'jest',
			},
		},
		dev: ['echo'],
	};

	await Promise.all([
		sandbox.createFile('package.json', { name: 'test-package' }),
		sandbox.createFile('files/file1.js', '// file1.js'),
		sandbox.createFile('static/static-file.js', '// static-file.js'),
		sandbox.createFile('static-1/static1-file.js', '// static1-file.js'),
		sandbox.createFile(
			'backtrack.config.js',
			`module.exports = ${JSON.stringify(config)}`,
		),
	]);

	/**
	 * Initial
	 */
	await backtrack();

	expect(await sandbox.readFile('package.json')).toEqual({
		name: 'test-package',
		scripts: {
			dev: 'backtrack dev --development',
			clean: 'backtrack clean',
			test: 'jest',
		},
	});

	const initialFileHash = await sandbox.getAllFilesHash();
	expect(initialFileHash).toMatchSnapshot();

	expect(processExitSpy).toHaveBeenCalledTimes(0);
	expect(handleErrorMock).toHaveBeenCalledTimes(0);

	/**
	 * Ensure no changes after initialization
	 */
	await backtrack();
	expect(await sandbox.getAllFilesHash()).toEqual(initialFileHash);

	/**
	 * runs dev script
	 */
	process.env.RUN_MODE = 'dev';
	await backtrack();

	/**
	 * Updates changed file
	 */
	process.env.RUN_MODE = 'init';
	await sandbox.createFile('files/file1.js', '// file1.js updated');

	await backtrack();
	expect(await sandbox.getAllFilesHash()).toMatchSnapshot();

	/**
	 * Removes dev and static dir
	 */
	process.env.RUN_MODE = 'init';

	delete config.dev;
	delete config.clean.copy;

	await sandbox.createFile(
		'backtrack.config.js',
		`module.exports = ${JSON.stringify(config)}`,
	);

	await backtrack();

	expect(await sandbox.readFile('package.json')).toEqual({
		name: 'test-package',
		scripts: {
			clean: 'backtrack clean',
			test: 'jest',
		},
	});

	expect(await sandbox.getAllFilesHash()).toMatchSnapshot();

	/**
	 * Removes everything
	 */
	process.env.RUN_MODE = 'init';

	await sandbox.createFile('backtrack.config.js', 'module.exports = {}');

	await backtrack();

	expect(await sandbox.readFile('package.json')).toEqual({
		name: 'test-package',
	});

	expect(await sandbox.getAllFilesHash()).toMatchSnapshot();
});

test('creates only latest when file already exists and new managed file that is allowed changed', async () => {
	process.env.RUN_MODE = 'init';

	const packageJson = {
		name: 'test-package',
		backtrack: {},
	};

	await sandbox.createFile('package.json', packageJson);

	await backtrack();

	await sandbox.createFile('src/file1.js', '// file1.js not managed');
	expect(await sandbox.getAllFilesHash()).toEqual({
		'.backtrack-stats.json': '6b6c16e551598a31afb4cdb307c906a4',
		'package.json': '868cadc53adb0af0948c8a0baa064e21',
		'src/file1.js': 'bf6054b34f42c85ee3f66a67000651c4',
	});

	/**
	 * add file that already exists
	 */
	// @ts-ignore
	packageJson.backtrack.files = {
		src: 'files/file1.js',
		dest: 'src/file1.js',
		allowChanges: true,
	};

	await Promise.all([
		sandbox.createFile('package.json', packageJson),
		sandbox.createFile('files/file1.js', '// file1.js managed'),
	]);

	await backtrack();

	expect(await sandbox.getAllFilesHash()).toEqual({
		'.backtrack-stats.json': '6e0b335edb90e56e26649d65ad400a06',
		'package.json': '653cc1e476188e9e4801ef77f5c8c2c5',
		'files/file1.js': '031895c8d5cd3c29681aa6713950d4c4',
		'src/file1.js': 'bf6054b34f42c85ee3f66a67000651c4',
		'src/file1.js-latest.js': '031895c8d5cd3c29681aa6713950d4c4',
	});
});

test('correctly handles files overridden in preset', async () => {
	process.env.RUN_MODE = 'init';

	await Promise.all([
		sandbox.createFile('preset1-files/file1.js', '// preset1 file1.js'),
		sandbox.createFile('preset2-files/file1.js', '// preset2 file1.js'),

		sandbox.createFile(
			'preset2.js',
			`'use strict';
const path = require('path');
module.exports = { files: { src: 'preset2-files/file1.js', dest: 'file1.js' } };
`,
		),
		sandbox.createFile(
			'preset1.js',
			`'use strict';
const path = require('path');
module.exports = {
  presets: [path.resolve(__dirname, 'preset2.js')],
  files: { src: 'preset1-files/file1.js', dest: 'file1.js' }
};`,
		),
	]);

	const packageJson = {
		name: 'test-package',
		backtrack: { presets: ['./preset1.js'] },
	};

	await sandbox.createFile('package.json', packageJson);

	await backtrack();

	const initialFiles = await sandbox.getAllFilesHash();

	expect(initialFiles).toEqual({
		'.backtrack-stats.json': '24d4ddc345ab79a921b5e32a635bce82',
		'package.json': 'd5cbc6109bc0df60cc9449ba538ddb78',
		'file1.js': 'ebec978d6ebcb14a97661268b956be1e',
		'preset1-files/file1.js': 'ebec978d6ebcb14a97661268b956be1e',
		'preset1.js': 'a68b9a86ea34a31e5f0a3f85d88b7188',
		'preset2-files/file1.js': '31b08120b26d1e362acaea87accfccdb',
		'preset2.js': 'ddf76e8e63dec5848a5e9e963b48495d',
	});

	await backtrack();
	expect(await sandbox.getAllFilesHash()).toEqual(initialFiles);
});

test('correctly handles multiple shell commands', async () => {
	/**
	 * Get del-cli path
	 */
	const delCli = require.resolve('del-cli/cli.js');

	const packageJson = {
		name: 'test-package',
		backtrack: {
			packageJson: {
				scripts: {
					'del-file1': `${delCli} ./file1.js`,
					'del-file2': `${delCli} ./file2.js`,
				},
			},
			'run-cmd': 'npm run del-file1 && npm run del-file2',
		},
	};

	await Promise.all([
		sandbox.createFile('file1.js', `console.log('file1.js');`),
		sandbox.createFile('file2.js', `console.log('file2.js');`),
		sandbox.createFile('package.json', packageJson),
	]);

	process.env.RUN_MODE = 'init';
	await backtrack();

	const initialFiles = await sandbox.getAllFilesHash();
	// @ts-ignore
	delete initialFiles['.backtrack-stats.json'];
	// @ts-ignore
	delete initialFiles['package.json'];

	expect(initialFiles).toEqual({
		'file1.js': 'ddfc5faf00a6852daf7c5ea10163d138',
		'file2.js': '5629bb53733e6f8c3af391f2cd47a8bd',
	});

	process.env.RUN_MODE = 'run-cmd';
	await backtrack();

	const filesRemoved = await sandbox.getAllFilesHash();
	// @ts-ignore
	delete filesRemoved['.backtrack-stats.json'];
	// @ts-ignore
	delete filesRemoved['package.json'];

	expect(filesRemoved).toEqual({});
});

test('correctly handles removing array values from managed package.json key', async () => {
	process.env.RUN_MODE = 'init';

	await Promise.all([
		sandbox.createFile('package.json', {
			name: 'test-package',
		}),

		sandbox.createFile(
			'backtrack.config.js',
			`module.exports = ${JSON.stringify({
				packageJson: {
					files: [
						'one/',
						'two/',
					],
				},
			})}`,
		),
	]);

	await backtrack();
	const initialFiles = await sandbox.getAllFilesHash();

	expect(initialFiles).toEqual({
		'.backtrack-stats.json': '6195c19fcd4629ea7fffb8bf1bd3a951',
		'backtrack.config.js': '6251fb7493b440a1530b031384c67632',
		'package.json': 'a6371c71981bcab5aeaa575e39e4994b',
	});

	await sandbox.createFile(
		'backtrack.config.js',
		`module.exports = ${JSON.stringify({
			packageJson: {
				files: ['one/'],
			},
		})}`,
	);

	await backtrack();
	// run twice, was previously adding backup file second run
	await backtrack();

	expect(await sandbox.getAllFilesHash()).toEqual({
		'.backtrack-stats.json': 'c40a50d3f34d257cbc0b124c3b53f543',
		'backtrack.config.js': 'ea70dd8597e9bd71cbf6901cb8a2e176',
		'package.json': '978b66e46622f48835a3d38dcb2f88a7',
	});
});

test('completely ignores updates to ignored source files', async () => {
	process.env.RUN_MODE = 'init';

	await Promise.all([
		sandbox.createFile('package.json', {
			name: 'test-package',
		}),

		sandbox.createFile('files/file1.js', '// file1.js'),

		sandbox.createFile(
			'backtrack.config.js',
			`module.exports = ${JSON.stringify({
				files: {
					src: 'files/file1.js',
					dest: 'file1.js',
					ignoreUpdates: true,
				},
			})}`,
		),
	]);

	await backtrack();
	const initialFiles = await sandbox.getAllFilesHash();

	expect(initialFiles).toEqual({
		'.backtrack-stats.json': 'b5302f926313cf6d6c7f269a2ddc0bbc',
		'backtrack.config.js': 'c940bddf3d3e702288435d3d5e4e6918',
		'file1.js': '7f477fcd51e87d9e65b134b17771dc03',
		'files/file1.js': '7f477fcd51e87d9e65b134b17771dc03',
		'package.json': 'f2b2d4935b7fc04f67fdd526e0bbeafe',
	});

	await Promise.all([
		sandbox.createFile('files/file1.js', '// file1.js nested modified'),
		sandbox.createFile('file1.js', '// file1.js modified'),
	]);

	await backtrack();

	// @ts-ignore
	// eslint-disable-next-line no-console
	const loggedUpdateMessage = console.info.mock.calls.some((message) => {
		return message[1].includes(
			'Unmanaged file file1.js source changed. Updating .backtrack-stats.json',
		);
	});
	expect(loggedUpdateMessage).toEqual(false);

	expect(await sandbox.getAllFilesHash()).toEqual({
		'.backtrack-stats.json': 'b5302f926313cf6d6c7f269a2ddc0bbc',
		'backtrack.config.js': 'c940bddf3d3e702288435d3d5e4e6918',
		'file1.js': '6ee14b91f6650d0d66df3d6abed83545',
		'files/file1.js': '75ca550e137beb27a115fc2bf7850290',
		'package.json': 'f2b2d4935b7fc04f67fdd526e0bbeafe',
	});
});
