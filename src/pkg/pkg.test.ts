import path from 'path';

function getPkg() {
	const Backtrack = require('../initialize/initialize').Initialize;

	const backtrack = new Backtrack();

	return backtrack.pkg;
}

describe('pkg', () => {
	const cwd = process.cwd();
	let pkg: any;

	beforeEach(() => {
		const dir = path.resolve(__dirname, '__sandbox__/app1/');
		process.chdir(dir);
		jest.doMock('parent-module', () => () => path.join(dir, 'testing.js'));

		pkg = getPkg();
	});

	afterEach(() => {
		process.chdir(cwd);
	});

	test('handles missing sourceId', () => {
		let error;
		try {
			pkg.resolve(undefined, 'eslint');
		} catch (e) {
			error = e;
		} finally {
			expect(error).toMatchSnapshot();
		}
	});

	test('handles missing packageId', () => {
		let error;
		try {
			pkg.resolve('preset-01');
		} catch (e) {
			error = e;
		} finally {
			expect(error).toMatchSnapshot();
		}
	});

	test('handles unmatched resolve source with none available', () => {
		let error;
		try {
			expect.hasAssertions();

			pkg.resolveMap = {};

			pkg.resolve('preset-01', 'eslint');
		} catch (e) {
			error = e;
		} finally {
			expect(error).toMatchSnapshot();
		}
	});

	test('handles unmatched resolve source', () => {
		let error;
		try {
			pkg.resolve('preset-01', 'eslint');
		} catch (e) {
			error = e;
		} finally {
			expect(error).toMatchSnapshot();
		}
	});
});
