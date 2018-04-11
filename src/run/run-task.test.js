/* @flow */

const runTask = (task, ...options) =>
    require('./run-task').runTask(task, ...options);

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const formatOptions = (options) =>
    options.length ? `|${options.join('|')}` : '';

const asyncResolve = (ms) => async (...options) => {
    await sleep(ms);

    const opts = formatOptions(options);

    return `asyncResolve_${ms + opts}`;
};

const asyncThrow = (ms) => async (...options) => {
    await sleep(ms);

    const opts = formatOptions(options);

    throw new Error(`asyncThrow_${ms + opts}`);
};

const asyncReject = (ms) => async (...options) => {
    await sleep(ms);

    const opts = formatOptions(options);

    return Promise.reject(new Error(`asyncReject_${ms + opts}`));
};

const syncFn = (id) => (...options) => {
    const opts = formatOptions(options);

    return `syncFn_${id + opts}`;
};

const syncThrow = (id) => (...options) => {
    const opts = formatOptions(options);

    throw new Error(`syncThrow_${id + opts}`);
};

describe('runTask', () => {
    let infoSpy;
    let warnSpy;
    let errorSpy;

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
    // it('handles shell command', async () => {
    //     expect.hasAssertions();
    //
    //     const task = 'eslint';
    //
    //     const result = await runTask(task);
    //     console.log(result);
    //
    //     expect(result).toMatchSnapshot();
    // });

    test('handles sync function', async () => {
        expect.hasAssertions();

        const task = syncFn(1);

        const result = await runTask(task);

        expect(result).toMatchSnapshot();
    });

    test('handles options', async () => {
        expect.hasAssertions();

        const task = syncFn(1);

        const result = await runTask(task, 1, 2, 3);

        expect(result).toMatchSnapshot();
    });

    test('handles sync throw', async () => {
        expect.hasAssertions();

        const task = syncThrow(1);

        try {
            await runTask(task);
        } catch (error) {
            expect(error).toMatchSnapshot();
        }
    });

    test('handles async function', async () => {
        expect.hasAssertions();

        const task = asyncResolve(1);

        const result = await runTask(task);

        expect(result).toMatchSnapshot();
    });

    test('handles async reject', async () => {
        expect.hasAssertions();

        const task = asyncReject(1);

        try {
            await runTask(task);
        } catch (error) {
            expect(error).toMatchSnapshot();
        }
    });

    test('handles async throw', async () => {
        expect.hasAssertions();

        const task = asyncThrow(1);

        try {
            await runTask(task);
        } catch (error) {
            expect(error).toMatchSnapshot();
        }
    });

    /**
     * Array of tasks
     */
    test('runs array of tasks', async () => {
        expect.hasAssertions();

        const tasks = [asyncResolve(10), asyncResolve(1), asyncResolve(5)];

        const result = await runTask(tasks);

        expect(result).toMatchSnapshot();
    });

    test('handles a task array', async () => {
        expect.hasAssertions();

        const tasks = [
            asyncResolve(20),
            [asyncResolve(10), asyncResolve(1), asyncResolve(20)],
            asyncResolve(1),
        ];

        const result = await runTask(tasks);

        expect(result).toMatchSnapshot();
    });

    test('handles sync functions', async () => {
        expect.hasAssertions();

        const tasks = [
            asyncResolve(10),
            syncFn(2),
            [asyncResolve(10), syncFn(1)],
            asyncResolve(5),
        ];

        const result = await runTask(tasks);

        expect(result).toMatchSnapshot();
    });

    test('handles async thrown errors', async () => {
        expect.hasAssertions();

        const tasks = [asyncResolve(20), asyncThrow(5), asyncResolve(10)];

        try {
            await runTask(tasks);
        } catch (error) {
            expect(error).toMatchSnapshot();
        }
    });

    test('handles sync thrown errors', async () => {
        expect.hasAssertions();

        const tasks = [asyncResolve(20), syncThrow(1), asyncResolve(10)];

        try {
            await runTask(tasks);
        } catch (error) {
            expect(error).toMatchSnapshot();
        }
    });

    test('handles async rejected errors', async () => {
        expect.hasAssertions();

        const tasks = [asyncResolve(20), asyncReject(5), asyncResolve(10)];

        try {
            await runTask(tasks);
        } catch (error) {
            expect(error).toMatchSnapshot();
        }
    });

    test('handles async task array errors', async () => {
        expect.hasAssertions();

        const tasks = [
            asyncResolve(15),
            [asyncResolve(10), asyncReject(5), asyncResolve(20)],
            asyncResolve(1),
        ];

        try {
            await runTask(tasks);
        } catch (error) {
            expect(error).toMatchSnapshot();
        }
    });

    test('handles sync task array errors', async () => {
        expect.hasAssertions();

        const tasks = [
            asyncResolve(15),
            [asyncResolve(10), syncThrow(5), asyncResolve(20)],
            asyncResolve(1),
        ];

        try {
            await runTask(tasks);
        } catch (error) {
            expect(error).toMatchSnapshot();
        }
    });

    test('passes options to all functions', async () => {
        expect.hasAssertions();

        const tasks = [
            asyncResolve(10),
            syncFn(2),
            [asyncResolve(10), syncFn(1)],
            asyncResolve(5),
        ];

        const result = await runTask(tasks, 1, 2, 3);

        expect(result).toMatchSnapshot();
    });

    /**
     * named objects
     */
    test('handles named objects', async () => {
        expect.hasAssertions();
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
        expect.hasAssertions();
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
        expect.hasAssertions();
        const tasks = [
            asyncResolve(4),

            {
                name: 'asyncResolve_10|syncFn_1',
                task: [[asyncResolve(10), syncFn(1)]],
            },

            asyncResolve(5),
        ];

        const result = await runTask(tasks);
        expect(result).toMatchSnapshot();
    });

    test('handles missing name', async () => {
        const tasks = [
            // $FlowIgnore
            {
                task: asyncResolve(10),
            },
        ];

        try {
            expect.hasAssertions();
            await runTask(tasks);
        } catch (error) {
            expect(error).toMatchSnapshot();
        }
    });

    test('handles missing task', async () => {
        expect.hasAssertions();
        const tasks = [
            // $FlowIgnore
            {
                name: 'asyncResolve_10',
            },
        ];

        try {
            expect.hasAssertions();
            await runTask(tasks);
        } catch (error) {
            expect(error).toMatchSnapshot();
        }
    });
});
