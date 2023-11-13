const runTask = (task: any, ...options: unknown[]) =>
	require('./run').runTask(task, ...options);

const sleep = async (ms: number) =>
	new Promise((resolve) => {
		setTimeout(resolve, ms);
	});
const formatOptions = (options: unknown[]) =>
	options.length ? `|${options.join('|')}` : '';

const asyncResolve =
	(ms: number) =>
	async (...options: unknown[]) => {
		await sleep(ms);

		const opts = formatOptions(options);

		return `asyncResolve_${ms + opts}`;
	};

const asyncThrow =
	(ms: number) =>
	async (...options: unknown[]) => {
		await sleep(ms);

		const opts = formatOptions(options);

		throw new Error(`asyncThrow_${ms + opts}`);
	};

const asyncReject =
	(ms: number) =>
	async (...options: unknown[]) => {
		await sleep(ms);

		const opts = formatOptions(options);

		return Promise.reject(new Error(`asyncReject_${ms + opts}`));
	};

const syncFn =
	(id: number) =>
	(...options: unknown[]) => {
		const opts = formatOptions(options);

		return `syncFn_${id + opts}`;
	};

const syncThrow =
	(id: number) =>
	(...options: unknown[]) => {
		const opts = formatOptions(options);

		throw new Error(`syncThrow_${id + opts}`);
	};

describe('runTask', () => {
	let infoSpy: any;
	let warnSpy: any;
	let errorSpy: any;

	beforeEach(() => {
		infoSpy = jest
			.spyOn(console, 'info')
			.mockImplementation(() => undefined);
		warnSpy = jest
			.spyOn(console, 'warn')
			.mockImplementation(() => undefined);
		errorSpy = jest
			.spyOn(console, 'error')
			.mockImplementation(() => undefined);
	});

	afterEach(() => {
		infoSpy.mockRestore();
		warnSpy.mockRestore();
		errorSpy.mockRestore();
	});

	/**
	 * single functions
	 */
	// eslint-disable-next-line jest/no-commented-out-tests
	// it('handles shell command', async () => {
	//     const task = 'eslint';
	//
	//     const result = await runTask(task);
	//     console.log(result);
	//
	//     expect(result).toMatchSnapshot();
	// });

	test('handles sync function', async () => {
		const task = syncFn(1);
		const result = await runTask(task);

		expect(result).toMatchSnapshot();
	});

	test('handles options', async () => {
		const task = syncFn(1);
		const result = await runTask(task, 1, 2, 3);

		expect(result).toMatchSnapshot();
	});

	test('handles sync throw', async () => {
		const task = syncThrow(1);

		let error;
		try {
			await runTask(task);
		} catch (e) {
			error = e;
		} finally {
			expect(error).toMatchSnapshot();
		}
	});

	test('handles async function', async () => {
		const task = asyncResolve(1);
		const result = await runTask(task);

		expect(result).toMatchSnapshot();
	});

	test('handles async reject', async () => {
		const task = asyncReject(1);

		let error;
		try {
			await runTask(task);
		} catch (e) {
			error = e;
		} finally {
			expect(error).toMatchSnapshot();
		}
	});

	test('handles async throw', async () => {
		const task = asyncThrow(1);

		let error;
		try {
			await runTask(task);
		} catch (e) {
			error = e;
		} finally {
			expect(error).toMatchSnapshot();
		}
	});

	/**
	 * Array of tasks
	 */
	test('runs array of tasks', async () => {
		const tasks = [
			asyncResolve(10),
			asyncResolve(1),
			asyncResolve(5),
		];

		const result = await runTask(tasks);
		expect(result).toMatchSnapshot();
	});

	test('handles a task array', async () => {
		const tasks = [
			asyncResolve(20),
			[
				asyncResolve(10),
				asyncResolve(1),
				asyncResolve(20),
			],
			asyncResolve(1),
		];

		const result = await runTask(tasks);
		expect(result).toMatchSnapshot();
	});

	test('handles sync functions', async () => {
		const tasks = [
			asyncResolve(10),
			syncFn(2),
			[
				asyncResolve(10),
				syncFn(1),
			],
			asyncResolve(5),
		];

		const result = await runTask(tasks);
		expect(result).toMatchSnapshot();
	});

	test('handles async thrown errors', async () => {
		const tasks = [
			asyncResolve(20),
			asyncThrow(5),
			asyncResolve(10),
		];

		let error;
		try {
			await runTask(tasks);
		} catch (e) {
			error = e;
		} finally {
			expect(error).toMatchSnapshot();
		}
	});

	test('handles sync thrown errors', async () => {
		const tasks = [
			asyncResolve(20),
			syncThrow(1),
			asyncResolve(10),
		];

		let error;
		try {
			await runTask(tasks);
		} catch (e) {
			error = e;
		} finally {
			expect(error).toMatchSnapshot();
		}
	});

	test('handles async rejected errors', async () => {
		const tasks = [
			asyncResolve(20),
			asyncReject(5),
			asyncResolve(10),
		];

		let error;
		try {
			await runTask(tasks);
		} catch (e) {
			error = e;
		} finally {
			expect(error).toMatchSnapshot();
		}
	});

	test('handles async task array errors', async () => {
		const tasks = [
			asyncResolve(15),
			[
				asyncResolve(10),
				asyncReject(5),
				asyncResolve(20),
			],
			asyncResolve(1),
		];

		let error;
		try {
			await runTask(tasks);
		} catch (e) {
			error = e;
		} finally {
			expect(error).toMatchSnapshot();
		}
	});

	test('handles sync task array errors', async () => {
		const tasks = [
			asyncResolve(15),
			[
				asyncResolve(10),
				syncThrow(5),
				asyncResolve(20),
			],
			asyncResolve(1),
		];

		let error;
		try {
			await runTask(tasks);
		} catch (e) {
			error = e;
		} finally {
			expect(error).toMatchSnapshot();
		}
	});

	test('passes options to all functions', async () => {
		const tasks = [
			asyncResolve(10),
			syncFn(2),
			[
				asyncResolve(10),
				syncFn(1),
			],
			asyncResolve(5),
		];

		const result = await runTask(tasks, 1, 2, 3);
		expect(result).toMatchSnapshot();
	});

	/**
	 * named objects
	 */
	test('handles named objects', async () => {
		const tasks = [
			{
				name: 'asyncResolve_10',
				task: asyncResolve(10),
			},
			// {
			//     name: 'syncFn_2',
			//     task: syncFn(2),
			// },
			// {
			//     name: 'asyncResolve_5',
			//     task: asyncResolve(5),
			// },
		];

		const result = await runTask(tasks);
		expect(result).toMatchSnapshot();
	});

	test('handles Promise.All outside task', async () => {
		const tasks = [
			asyncResolve(10),
			[
				{
					name: 'asyncResolve_5',
					task: asyncResolve(5),
				},
				syncFn(2),
			],
		];

		const result = await runTask(tasks);
		expect(result).toMatchSnapshot();
	});

	test('handles Promise.All inside task', async () => {
		const tasks = [
			asyncResolve(4),

			{
				name: 'asyncResolve_10|syncFn_1',
				task: [
					[
						asyncResolve(10),
						syncFn(1),
					],
				],
			},

			asyncResolve(5),
		];

		const result = await runTask(tasks);
		expect(result).toMatchSnapshot();
	});

	test('handles missing name', async () => {
		const tasks = [
			{
				task: asyncResolve(10),
			},
		];

		let error;
		try {
			await runTask(tasks);
		} catch (e) {
			error = e;
		} finally {
			expect(error).toMatchSnapshot();
		}
	});

	test('handles missing task', async () => {
		const tasks = [
			{
				name: 'asyncResolve_10',
			},
		];

		let error;
		try {
			await runTask(tasks);
		} catch (e) {
			error = e;
		} finally {
			expect(error).toMatchSnapshot();
		}
	});
});

// Use an empty export to please Babel's single file emit.
// https://github.com/Microsoft/TypeScript/issues/15230
export {};
