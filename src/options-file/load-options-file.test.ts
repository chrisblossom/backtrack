import path from 'path';

const loadOptionsFile = (dir?: any) =>
	require('./load-options-file').loadOptionsFile(dir);

describe('options', () => {
	const cwd = process.cwd();

	afterEach(() => {
		process.chdir(cwd);
	});

	test('handles module.exports', () => {
		const dir = path.resolve(__dirname, '__sandbox__/module-exports/');
		process.chdir(dir);

		const opts = loadOptionsFile();

		expect(opts).toEqual({ presets: ['module_exports'] });
	});

	test('handles module.exports - .backtrackrc.js', () => {
		const dir = path.resolve(__dirname, '__sandbox__/module-exports-rc/');
		process.chdir(dir);

		const opts = loadOptionsFile();

		expect(opts).toEqual({ presets: ['module_exports_rc'] });
	});

	test('loads ES Modules config', () => {
		const dir = path.resolve(__dirname, '__sandbox__/es-modules/');
		process.chdir(dir);

		const opts = loadOptionsFile();

		expect(opts).toEqual({ presets: ['es_modules'] });
	});

	test('throws on missing config', () => {
		const dir = path.resolve(__dirname, '__sandbox__/missing/');
		process.chdir(dir);

		let error;
		try {
			loadOptionsFile();
		} catch (e) {
			error = e;
		} finally {
			expect(error).toHaveProperty('exitCode', 1);
			expect(error).toMatchInlineSnapshot(
				`[Error: backtrack config not found]`,
			);
		}
	});

	test('throws if ES Modules without default', () => {
		const dir = path.resolve(
			__dirname,
			'__sandbox__/es-modules-no-default/',
		);
		process.chdir(dir);

		let error;
		try {
			loadOptionsFile();
		} catch (e) {
			error = e;
		} finally {
			expect(error).toHaveProperty('exitCode', 1);
			expect(error).toMatchInlineSnapshot(
				`[Error: <PROJECT_ROOT>/backtrack.config.js must use default export with ES Modules]`,
			);
		}
	});

	test('config must be in rootDir/process.cwd()', () => {
		const dir = path.resolve(__dirname, '__sandbox__/outside-cwd/cwd/');
		process.chdir(dir);

		let error;
		try {
			loadOptionsFile();
		} catch (e: unknown) {
			error = e;
		} finally {
			expect(error).toHaveProperty('exitCode', 1);
			expect(error).toMatchInlineSnapshot(
				`[Error: backtrack config not found]`,
			);
		}
	});

	test('handles custom searchPath', () => {
		const dir = path.resolve(__dirname, '__sandbox__/module-exports/');

		const opts = loadOptionsFile(dir);

		expect(opts).toEqual({ presets: ['module_exports'] });
	});
});
