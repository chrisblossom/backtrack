import type { BacktrackConfig } from '../types';
import { presetValidator } from './preset-validator';

describe('presetValidator', () => {
	test('handles undefined', () => {
		expect(() => {
			presetValidator();
		}).not.toThrow();
	});

	test('preset passes', () => {
		const value = require('./__sandbox__/preset-01');

		expect(() => {
			presetValidator({ value });
		}).not.toThrow();
	});

	test('preset passes with options', () => {
		const value = {
			presets: [
				[
					'./__sandbox__/preset-01',
					{ options: true },
				],
			],
		};

		expect(() => {
			// @ts-expect-error
			presetValidator({ value });
		}).not.toThrow();
	});

	test('preset validates custom lifecycles', () => {
		const value = {
			invalid1: new Date('2017-12-05T18:02:11.869Z'),
		};

		let error;
		try {
			// @ts-expect-error
			presetValidator({ value });
		} catch (e) {
			error = e;
		} finally {
			expect(error).toMatchSnapshot();
		}
	});

	test('preset allows no valid options', () => {
		const value = {};
		expect(() => {
			presetValidator({ value });
		}).not.toThrow();
	});

	test('allows empty presets', () => {
		// @ts-expect-error
		const value: BacktrackConfig = {
			dev: [],
			clean: [],
			build: [],
			lint: [],
			test: [],
			files: [],
			format: [],
			packageJson: [],
			config: {},
		};

		expect(() => {
			presetValidator({ value });
		}).not.toThrow();
	});

	test('config fails as array', () => {
		const value = {
			config: [],
		};

		let error;
		try {
			presetValidator({ value });
		} catch (e) {
			error = e;
		} finally {
			expect(error).toMatchSnapshot();
		}
	});

	test('config works as a plain object', () => {
		const value = {
			config: {
				eslint: {
					'no-console': 'off',
				},
			},
		};

		expect(() => {
			// @ts-expect-error
			presetValidator({ value });
		}).not.toThrow();
	});

	test('fails with unknown key', () => {
		const value = {
			clean: [
				{
					del: ['*'],
					makeDirs: ['dir'],
					excess: 'something',
				},
			],
		};

		let error;
		try {
			// @ts-expect-error
			presetValidator({ value });
		} catch (e) {
			error = e;
		} finally {
			expect(error).toMatchSnapshot();
		}
	});

	test('fails no options - makeDirs', () => {
		const value = {
			clean: [
				{
					makeDirs: [''],
				},
			],
		};

		let error;
		try {
			// @ts-expect-error
			presetValidator({ value });
		} catch (e) {
			error = e;
		} finally {
			expect(error).toMatchSnapshot();
		}
	});

	test('fails no options - del', () => {
		const value = {
			clean: [
				{
					del: [''],
				},
			],
		};

		let error;
		try {
			// @ts-expect-error
			presetValidator({ value });
		} catch (e) {
			error = e;
		} finally {
			expect(error).toMatchSnapshot();
		}
	});

	test('success on clean', () => {
		const value = {
			clean: [
				{
					copy: {
						src: 'static',
						dest: 'static',
					},
				},
				{
					del: ['**'],
					makeDirs: ['fake/dir'],
				},
			],
		};

		expect(() => {
			// @ts-expect-error
			presetValidator({ value });
		}).not.toThrow();
	});

	test('success with files options', () => {
		const value = {
			files: [
				{
					src: 'file1.js',
					dest: 'file1.js',
				},
				{
					src: 'nested/inside.js',
					dest: 'nested/inside.js',
					allowChanges: true,
				},
				{
					src: 'nested/inside.js',
					dest: 'nested/inside.js',
					ignoreUpdates: true,
				},
				{
					src: 'nested/inside.js',
					dest: 'nested/inside.js',
					allowChanges: true,
					ignoreUpdates: true,
				},
				{
					src: 'nested/other.js',
					dest: 'nested/other.js',
				},
				{
					skip: ['file1.js'],
					allowChanges: ['file1.js'],
					makeDirs: ['dist'],
					ignoreUpdates: true,
				},
				{
					skip: ['file1.js'],
				},
				{
					makeDirs: ['dist'],
				},
				{
					allowChanges: true,
				},
				{
					ignoreUpdates: true,
				},
			],
		};

		expect(() => {
			// @ts-expect-error
			presetValidator({ value });
		}).not.toThrow();
	});

	test('success with resolve', () => {
		const value = {
			resolve: {
				'some-npm-pkg': '/path/to/pkg',
			},
		};
		expect(() => {
			// @ts-expect-error
			presetValidator({ value });
		}).not.toThrow();
	});
});
