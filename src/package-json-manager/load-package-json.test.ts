import path from 'path';
import type { loadPackageJson as loadPackageJsonType } from './load-package-json';

type LoadPackageJson = typeof loadPackageJsonType;
const loadPackageJson = async (): ReturnType<LoadPackageJson> =>
	require('./load-package-json').loadPackageJson();

describe('loadPackageJson', () => {
	const cwd = process.cwd();

	afterEach(() => {
		process.chdir(cwd);
	});

	test('loads stat file', async () => {
		const dir = path.resolve(__dirname, '__sandbox__/found-package-json/');
		process.chdir(dir);

		const result = await loadPackageJson();

		expect(result).toEqual({
			name: 'found_package_json',
			private: true,
		});
	});

	test('fail when package json does not exist', async () => {
		const dir = path.resolve(
			__dirname,
			'__sandbox__/missing-package-json/',
		);
		process.chdir(dir);

		let error;
		try {
			await loadPackageJson();
		} catch (e) {
			error = e;
		} finally {
			expect(error).toMatchInlineSnapshot(
				`[Error: package.json not found]`,
			);
		}
	});
});
