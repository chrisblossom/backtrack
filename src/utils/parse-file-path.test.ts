import path from 'path';
import type {
	parseFilePath as ParseFilePathType,
	parseFilePathSync as ParseFilePathSyncType,
} from './parse-file-path';

type ParseFilePath = typeof ParseFilePathType;
const parseFilePath = async (
	...args: Parameters<ParseFilePath>
): ReturnType<ParseFilePath> =>
	require('./parse-file-path').parseFilePath(...args);

type ParseFilePathSync = typeof ParseFilePathSyncType;
const parseFilePathSync = (
	...args: Parameters<ParseFilePathSync>
): ReturnType<ParseFilePathSync> =>
	require('./parse-file-path').parseFilePathSync(...args);

describe('parseFilePath', () => {
	const cwd = process.cwd();
	let dir: string;

	beforeEach(() => {
		dir = path.resolve(__dirname, '__sandbox__/files1/');
		process.chdir(dir);
	});

	afterEach(() => {
		process.chdir(cwd);
	});

	test('parses absolute file', async () => {
		const file = path.resolve(dir, 'test-file.js');

		const resultAsync = await parseFilePath(file);
		const resultSync = parseFilePathSync(file);

		expect(resultAsync).toMatchInlineSnapshot(`
{
  "absolute": "<PROJECT_ROOT>/test-file.js",
  "hash": "b2c22cd66511e73bc0c189cc169bf13ef5ffd2fc1c988b5f0eb0cbf992456767",
  "relative": "test-file.js",
}
`);
		expect(resultSync).toMatchInlineSnapshot(`
{
  "absolute": "<PROJECT_ROOT>/test-file.js",
  "hash": "b2c22cd66511e73bc0c189cc169bf13ef5ffd2fc1c988b5f0eb0cbf992456767",
  "relative": "test-file.js",
}
`);
	});

	test('parses relative file', async () => {
		const file = 'test-file.js';

		const resultAsync = await parseFilePath(file);
		const resultSync = parseFilePathSync(file);

		expect(resultAsync).toMatchInlineSnapshot(`
{
  "absolute": "<PROJECT_ROOT>/test-file.js",
  "hash": "b2c22cd66511e73bc0c189cc169bf13ef5ffd2fc1c988b5f0eb0cbf992456767",
  "relative": "test-file.js",
}
`);
		expect(resultSync).toMatchInlineSnapshot(`
{
  "absolute": "<PROJECT_ROOT>/test-file.js",
  "hash": "b2c22cd66511e73bc0c189cc169bf13ef5ffd2fc1c988b5f0eb0cbf992456767",
  "relative": "test-file.js",
}
`);
	});

	test('parses nested relative file', async () => {
		const file = 'nested/other.js';

		const resultAsync = await parseFilePath(file);
		const resultSync = parseFilePathSync(file);

		expect(resultAsync).toMatchInlineSnapshot(`
{
  "absolute": "<PROJECT_ROOT>/nested/other.js",
  "hash": "4a98043a27f1a81a69af211207912f39873a6fe693be4cedb6bebd33cd3f2da7",
  "relative": "nested/other.js",
}
`);
		expect(resultSync).toMatchInlineSnapshot(`
{
  "absolute": "<PROJECT_ROOT>/nested/other.js",
  "hash": "4a98043a27f1a81a69af211207912f39873a6fe693be4cedb6bebd33cd3f2da7",
  "relative": "nested/other.js",
}
`);
	});

	test('parses nested absolute file', async () => {
		const file = path.resolve(dir, 'nested/other.js');

		const resultAsync = await parseFilePath(file);
		const resultSync = parseFilePathSync(file);

		expect(resultAsync).toMatchInlineSnapshot(`
{
  "absolute": "<PROJECT_ROOT>/nested/other.js",
  "hash": "4a98043a27f1a81a69af211207912f39873a6fe693be4cedb6bebd33cd3f2da7",
  "relative": "nested/other.js",
}
`);
		expect(resultSync).toMatchInlineSnapshot(`
{
  "absolute": "<PROJECT_ROOT>/nested/other.js",
  "hash": "4a98043a27f1a81a69af211207912f39873a6fe693be4cedb6bebd33cd3f2da7",
  "relative": "nested/other.js",
}
`);
	});

	test('parses ./ relative file', async () => {
		const file = path.resolve(dir, './nested/other.js');

		const resultAsync = await parseFilePath(file);
		const resultSync = parseFilePathSync(file);

		expect(resultAsync).toMatchInlineSnapshot(`
{
  "absolute": "<PROJECT_ROOT>/nested/other.js",
  "hash": "4a98043a27f1a81a69af211207912f39873a6fe693be4cedb6bebd33cd3f2da7",
  "relative": "nested/other.js",
}
`);
		expect(resultSync).toMatchInlineSnapshot(`
{
  "absolute": "<PROJECT_ROOT>/nested/other.js",
  "hash": "4a98043a27f1a81a69af211207912f39873a6fe693be4cedb6bebd33cd3f2da7",
  "relative": "nested/other.js",
}
`);
	});

	test('returns empty string when file does not exist', async () => {
		const file = path.resolve(dir, './missing-file.js');

		const resultAsync = await parseFilePath(file);
		const resultSync = parseFilePathSync(file);

		expect(resultAsync).toMatchInlineSnapshot(`
{
  "absolute": "<PROJECT_ROOT>/missing-file.js",
  "hash": "",
  "relative": "missing-file.js",
}
`);
		expect(resultSync).toMatchInlineSnapshot(`
{
  "absolute": "<PROJECT_ROOT>/missing-file.js",
  "hash": "",
  "relative": "missing-file.js",
}
`);
	});
});
