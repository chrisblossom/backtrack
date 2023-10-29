import path from 'path';

function configManager(args: any) {
	const Backtrack = require('../initialize/initialize').Initialize;

	const backtrack = new Backtrack();

	return backtrack.configManager(args);
}

describe('configManager', () => {
	const cwd = process.cwd();

	beforeEach(() => {
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

	test('throws when backtrack config is not found', () => {
		const dir = path.resolve(
			__dirname,
			'__sandbox__/backtrack-config-missing/',
		);
		process.chdir(dir);
		jest.doMock('parent-module', () => () => path.join(dir, 'testing.js'));

		const config = {
			extends: ['airbnb-base'],
		};

		let error;
		try {
			configManager({
				config,
				namespace: 'backtrack-config-missing',
			});
		} catch (e) {
			error = e;
		} finally {
			expect(error).toMatchSnapshot();
		}
	});

	test('returns original config when no custom config found for current config', () => {
		const dir = path.resolve(__dirname, '__sandbox__/no-custom-config-2/');
		process.chdir(dir);
		jest.doMock('parent-module', () => () => path.join(dir, 'testing.js'));

		const config = {
			extends: ['airbnb-base'],
		};

		const result = configManager({
			config,
			namespace: 'no_custom_config_2',
		});

		expect(result === config).toEqual(true);
	});

	test('merges config by default', () => {
		const dir = path.resolve(__dirname, '__sandbox__/custom-config-1/');
		process.chdir(dir);
		jest.doMock('parent-module', () => () => path.join(dir, 'testing.js'));

		const config = {
			extends: ['airbnb-base'],
		};

		const result = configManager({
			config,
			namespace: 'custom_config_1',
		});

		expect(result).toEqual({
			extends: ['airbnb-base'],
			rules: { semi: 'always' },
		});
	});

	test('handles nested config file', () => {
		const dir = path.resolve(__dirname, '__sandbox__/custom-config-1/');
		process.chdir(dir);
		jest.doMock(
			'parent-module',
			() => () => path.join(dir, 'nested/testing.js'),
		);

		const config = {
			extends: ['airbnb-base'],
		};

		const result = configManager({
			config,
			namespace: 'custom_config_1',
		});

		expect(result).toEqual({
			extends: ['airbnb-base'],
			rules: { semi: 'always' },
		});
	});
});
