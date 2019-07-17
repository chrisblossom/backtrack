import path from 'path';
import { getFileHash } from './get-file-hash';

describe('getFileHash', () => {
	const dir = path.resolve(__dirname, '__sandbox__/files1');
	const cwd = process.cwd();

	beforeEach(() => {
		process.chdir(dir);
	});

	afterEach(() => {
		process.chdir(cwd);
	});

	test('gets hash', () => {
		const file = path.resolve(dir, 'test-file.js');

		const result = getFileHash(file);

		expect(result).toMatchSnapshot();
	});

	test('gets hash sha512', () => {
		const file = path.resolve(dir, 'test-file.js');

		const result = getFileHash(file, 'sha512');

		expect(result).toMatchSnapshot();
	});

	test('fails when file not found', () => {
		const file = path.resolve(dir, 'file_not_found.js');

		try {
			expect.hasAssertions();
			getFileHash(file);
		} catch (error) {
			expect(error).toMatchSnapshot();
		}
	});
});
