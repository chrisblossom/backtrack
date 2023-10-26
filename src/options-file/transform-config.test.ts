import path from 'path';

const transformConfig = (config: any, dirname?: any) =>
	require('./transform-config').transformConfig(config, dirname);

describe('transformConfig', () => {
	const cwd = process.cwd();

	afterEach(() => {
		process.chdir(cwd);
	});

	test('handles one preset', () => {
		const dir = path.resolve(__dirname, '__sandbox__/app1/');
		process.chdir(dir);

		const config = {
			presets: ['01'],
			clean: [
				{
					del: [
						'**/*',
						'!.gitignore',
					],
					makeDirs: ['static/favicons'],
					copy: [
						{
							src: 'static-3',
							dest: 'static-3',
						},
					],
				},
			],
			dev: ['base'],
		};

		const result = transformConfig(config);

		expect(result).toMatchSnapshot();
	});

	test('handles false', () => {
		const dir = path.resolve(__dirname, '__sandbox__/app1/');
		process.chdir(dir);

		const config = {
			presets: ['01'],
			clean: false,
		};

		const result = transformConfig(config);

		expect(result).toMatchSnapshot();
	});

	test('handles false with additional task', () => {
		const dir = path.resolve(__dirname, '__sandbox__/app1/');
		process.chdir(dir);

		const config = {
			presets: ['01'],
			clean: [
				false,
				{ del: 'static' },
			],
		};

		const result = transformConfig(config);

		expect(result).toMatchSnapshot();
	});

	test('handles false in middle of preset chain', () => {
		const dir = path.resolve(__dirname, '__sandbox__/app1/');
		process.chdir(dir);

		const config = {
			presets: ['03'],
			dev: ['base'],
		};

		const result = transformConfig(config);

		expect(result).toMatchSnapshot();
	});

	test('handles false in middle of preset chain with additional task', () => {
		const dir = path.resolve(__dirname, '__sandbox__/app1/');
		process.chdir(dir);

		const config = {
			presets: ['04'],
			dev: ['base'],
		};

		const result = transformConfig(config);

		expect(result).toMatchSnapshot();
	});

	test('handles false in middle of long preset chain', () => {
		const dir = path.resolve(__dirname, '__sandbox__/app1/');
		process.chdir(dir);

		const config = {
			presets: ['05'],
			dev: ['base'],
		};

		const result = transformConfig(config);

		expect(result).toMatchSnapshot();
	});
});
