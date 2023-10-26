import path from 'path';
import { normalizeStats } from './normalize-stats';

test('load', () => {
	const stats = {
		fileManager: {
			directories: [
				'dist',
				'nested/one',
				'src',
			],
			files: {
				'.eslintrc.js':
					'059a0b7f26dc50ebe483a7eee4534bfd08d0c5816113e3b0b10782e8ab57ec57',
				'nested/file1.js':
					'8b6fd065dc80e6386779fb0188ecfc77fcf4f00fc7f2be965b3035d1577f6347',
				'nested/one/file2.js':
					'6e1878e518fe0e6d4d5445ec84694c99df98b1503eb5c5e91bbd70d0c21114bd',
			},
		},
		packageJson: {
			scripts: {
				clean: 'backtrack clean',
				dev: 'backtrack dev --development',
			},
		},
	};

	const result = normalizeStats.load(stats);
	expect(result).toEqual({
		fileManager: {
			directories: [
				path.normalize('dist'),
				path.normalize('nested/one'),
				path.normalize('src'),
			],
			files: {
				[path.normalize('.eslintrc.js')]:
					'059a0b7f26dc50ebe483a7eee4534bfd08d0c5816113e3b0b10782e8ab57ec57',
				[path.normalize('nested/file1.js')]:
					'8b6fd065dc80e6386779fb0188ecfc77fcf4f00fc7f2be965b3035d1577f6347',
				[path.normalize('nested/one/file2.js')]:
					'6e1878e518fe0e6d4d5445ec84694c99df98b1503eb5c5e91bbd70d0c21114bd',
			},
		},
		packageJson: {
			scripts: {
				clean: 'backtrack clean',
				dev: 'backtrack dev --development',
			},
		},
	});
});

test('write', () => {
	const stats = {
		fileManager: {
			directories: [
				path.normalize('dist'),
				path.normalize('nested/one'),
				path.normalize('src'),
			],
			files: {
				[path.normalize('.eslintrc.js')]:
					'059a0b7f26dc50ebe483a7eee4534bfd08d0c5816113e3b0b10782e8ab57ec57',
				[path.normalize('nested/file1.js')]:
					'8b6fd065dc80e6386779fb0188ecfc77fcf4f00fc7f2be965b3035d1577f6347',
				[path.normalize('nested/one/file2.js')]:
					'6e1878e518fe0e6d4d5445ec84694c99df98b1503eb5c5e91bbd70d0c21114bd',
			},
		},
		packageJson: {
			scripts: {
				clean: 'backtrack clean',
				dev: 'backtrack dev --development',
			},
		},
	};

	const result = normalizeStats.write(stats);
	expect(result).toEqual({
		fileManager: {
			directories: [
				'dist',
				'nested/one',
				'src',
			],
			files: {
				'.eslintrc.js':
					'059a0b7f26dc50ebe483a7eee4534bfd08d0c5816113e3b0b10782e8ab57ec57',
				'nested/file1.js':
					'8b6fd065dc80e6386779fb0188ecfc77fcf4f00fc7f2be965b3035d1577f6347',
				'nested/one/file2.js':
					'6e1878e518fe0e6d4d5445ec84694c99df98b1503eb5c5e91bbd70d0c21114bd',
			},
		},
		packageJson: {
			scripts: {
				clean: 'backtrack clean',
				dev: 'backtrack dev --development',
			},
		},
	});
});
