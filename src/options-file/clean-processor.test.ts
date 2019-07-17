import path from 'path';
import { buildPath, rootPath } from '../config/paths';

const cleanProcessor = (args: any) =>
	require('./clean-processor').cleanProcessor(args);

const cleanPreprocessor = (args: any) =>
	require('./clean-preprocessor').cleanPreprocessor(args);

function getValue(value: any) {
	return cleanPreprocessor({ value });
}

describe('cleanProcessor', () => {
	test('merges args together and completes resolves path', () => {
		const current = {
			del: ['first', 'second'],
			makeDirs: [
				path.resolve(buildPath, 'first'),
				path.resolve(buildPath, 'second'),
			],

			copy: [
				{
					src: path.resolve(rootPath, 'static-1'),
					dest: path.resolve(buildPath, 'static-1'),
				},
			],
		};

		const value = getValue([
			{
				del: ['third'],
				makeDirs: ['third'],
				copy: [
					{
						src: 'static-2',
						dest: 'static-2',
					},
					{
						src: 'static-3',
						dest: 'static-3',
						hash: true,
					},
				],
			},
		]);

		const result = cleanProcessor({ current, value });

		expect(result).toMatchSnapshot();
	});

	test('removes duplicates', () => {
		const value = getValue([
			{
				del: ['first'],
				makeDirs: ['first'],
				copy: [
					{
						src: 'static-1',
						dest: 'static-1',
					},
				],
			},
			{
				del: ['first'],
				makeDirs: ['first'],
				copy: [
					{
						src: 'static-1',
						dest: 'static-1',
					},
					{
						src: 'static-1',
						dest: 'static-1',
						hash: true,
					},
				],
			},
		]);

		const result = cleanProcessor({ value });

		expect(result).toMatchSnapshot();
	});
});
