import {
	getParentsFromPath,
	mapObjectKeyNames,
	mergeDeep,
	toArray,
} from './object-utils';

describe('toArray', () => {
	test('converts value to array', () => {
		const value = 'test';
		const result = toArray(value);

		expect(result).toEqual([value]);
	});

	test('does nothing when already an array', () => {
		const value = ['test'];
		const result = toArray(value);

		expect(result).toEqual(value);
	});

	test('returns empty array when undefined', () => {
		// @ts-ignore
		const result = toArray();

		expect(result).toEqual([]);
	});
});

describe('mapObjectKeyNames', () => {
	test('returns array of keys', () => {
		const object = {
			a: {
				b: 1,
			},
			c: 2,
		};

		const result = mapObjectKeyNames(object);
		expect(result).toEqual([
			[
				'a',
				'b',
			],
			['c'],
		]);
	});

	test('handles periods in key', () => {
		const object = {
			'a.e': {
				'b.d': 1,
			},
			c: 2,
		};

		const result = mapObjectKeyNames(object);
		expect(result).toEqual([
			[
				'a.e',
				'b.d',
			],
			['c'],
		]);
	});

	test('handles undefined', () => {
		const result = mapObjectKeyNames();
		expect(result).toEqual([]);
	});

	test('handles empty object', () => {
		const result = mapObjectKeyNames({});
		expect(result).toEqual([]);
	});
});

describe('getParentsFromPath', () => {
	test('handles undefined', () => {
		// @ts-ignore
		const result = getParentsFromPath();

		expect(result).toEqual([]);
	});

	test('handles empty array', () => {
		const path: string[] = [];

		const result = getParentsFromPath(path);

		expect(result).toEqual([]);
	});

	test('returns one object path', () => {
		const path = ['one'];

		const result = getParentsFromPath(path);

		expect(result).toEqual([['one']]);
	});

	test('returns object paths', () => {
		const path = [
			'one',
			'two',
			'three',
		];

		const result = getParentsFromPath(path);

		expect(result).toEqual([
			[
				'one',
				'two',
				'three',
			],
			[
				'one',
				'two',
			],
			['one'],
		]);
	});

	test('handles escaped paths', () => {
		const path = [
			'o.ne',
			'split.path',
			'th.ree',
		];

		const result = getParentsFromPath(path);

		expect(result).toEqual([
			[
				'o.ne',
				'split.path',
				'th.ree',
			],
			[
				'o.ne',
				'split.path',
			],
			['o.ne'],
		]);
	});
});

describe('mergeDeep', () => {
	test('deep merges objects', () => {
		const obj1 = {
			one: 1,
			two: {
				inside1: 'one',
				inside2: {
					inside1: ['1'],
					inside2: '1',
				},
			},
		};

		const obj2 = {
			two: {
				inside2: {
					inside1: ['2'],
					inside2: '2',
					inside3: '2',
				},
			},
		};

		const obj3 = {
			two: {
				inside2: {
					inside1: ['3'],
					inside2: '2',
					inside3: 3,
				},
			},
			three: 3,
		};

		const result = mergeDeep(obj1, obj2, obj3);

		expect(result).toEqual({
			one: 1,
			two: {
				inside1: 'one',
				inside2: {
					inside1: [
						'1',
						'2',
						'3',
					],
					inside2: '2',
					inside3: 3,
				},
			},
			three: 3,
		});
	});

	test('does not mutate original object', () => {
		const obj1 = {
			one: 1,
			two: ['1'],
		};
		const obj2 = {
			one: 2,
		};

		const result = mergeDeep(obj1, obj2);

		expect(result === obj1).toEqual(false);
		expect(result.two === obj1.two).toEqual(false);
	});
});
