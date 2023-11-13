import path from 'path';
import { getFileHash, getFileHashSync } from './get-file-hash';

describe('getFileHash', () => {
	const dir = path.resolve(__dirname, '__sandbox__/files1');
	const cwd = process.cwd();

	beforeEach(() => {
		process.chdir(dir);
	});

	afterEach(() => {
		process.chdir(cwd);
	});

	test('gets hash', async () => {
		const file = path.resolve(dir, 'test-file.js');

		const resultAsync = await getFileHash(file);
		const resultSync = getFileHashSync(file);

		const expectedHash =
			'b2c22cd66511e73bc0c189cc169bf13ef5ffd2fc1c988b5f0eb0cbf992456767';
		expect(resultAsync).toEqual(expectedHash);
		expect(resultSync).toEqual(expectedHash);
	});

	test('gets hash sha512', async () => {
		const file = path.resolve(dir, 'test-file.js');

		const hashType = 'sha512';
		const resultAsync = await getFileHash(file, hashType);
		const resultSync = getFileHashSync(file, hashType);

		const expectedHash =
			'02fbcf012104a80bcf56c46ee6e12a73362d0fb54fa42bfe8a4cf2736c5f22c88e8bd6ade5d2b241e681c8aab7bade1b482b6bc763997704b07152f39311535e';
		expect(resultAsync).toEqual(expectedHash);
		expect(resultSync).toEqual(expectedHash);
	});

	test('fails when file not found', async () => {
		const file = path.resolve(dir, 'file_not_found.js');

		let error;
		try {
			await getFileHash(file);
		} catch (e) {
			error = e;
		} finally {
			expect(error).toMatchInlineSnapshot(
				`[Error: ENOENT: no such file or directory, open '<PROJECT_ROOT>/file_not_found.js']`,
			);
		}

		try {
			getFileHashSync(file);
		} catch (e) {
			error = e;
		} finally {
			expect(error).toMatchInlineSnapshot(
				`[Error: ENOENT: no such file or directory, open '<PROJECT_ROOT>/file_not_found.js']`,
			);
		}
	});
});
