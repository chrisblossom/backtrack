import path from 'path';

const backupFile = (file: string) => require('./backup-file').backupFile(file);

describe('backupFile', () => {
	const dir = path.resolve(__dirname, '__sandbox__/backup-file/');
	const cwd = process.cwd();
	let move = jest.requireMock('fs-extra').move;

	beforeEach(() => {
		move = jest.requireMock('fs-extra').move;

		jest.mock('fs-extra', () => ({
			move: jest.fn(() => Promise.resolve()),
		}));

		jest.mock('../utils/log', () => ({
			warn: jest.fn(),
		}));

		process.chdir(dir);
	});

	afterEach(() => {
		process.chdir(cwd);
	});

	test('backups file', async () => {
		const file = path.resolve(dir, 'file1.js');

		const result = await backupFile(file);

		expect(result).toMatchSnapshot();
		expect(move.mock.calls).toMatchSnapshot();
	});

	test('backups file inside nested folder', async () => {
		const file = path.resolve(dir, 'nested/nested-file1.js');

		const result = await backupFile(file);

		expect(result).toMatchSnapshot();
		expect(move.mock.calls).toMatchSnapshot();
	});

	test('does nothing if backup file already exists and hash matches', async () => {
		const file = path.resolve(dir, 'file2.js');

		const result = await backupFile(file);

		expect(result).toEqual(undefined);
		expect(move.mock.calls).toEqual([]);
	});

	test('appends -NUM to file when backed up file is modified', async () => {
		const file = path.resolve(dir, 'file3.js');

		const result = await backupFile(file);

		expect(result).toMatchSnapshot();
		expect(move.mock.calls).toMatchSnapshot();
	});

	test('will fail if count >= 10', async () => {
		const file = path.resolve(dir, 'existing/file4.js');

		let error;
		try {
			await backupFile(file);
		} catch (e) {
			error = e;
		} finally {
			expect(error).toMatchSnapshot();
			expect(move.mock.calls).toEqual([]);
		}
	});
});
