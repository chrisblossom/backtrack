import path from 'path';

const start = () => require('./start').start();

describe('start', () => {
	const cwd = process.cwd();
	let RUN_MODE: any;
	let run: any;

	beforeEach(() => {
		jest.mock('../utils/log', () => ({
			warn: jest.fn(),
			info: jest.fn(),
			error: jest.fn(),
			success: jest.fn(),
		}));

		run = jest.requireMock('../run/run').run;
		jest.mock('../run/run', () => ({ run: jest.fn() }));
		jest.mock('../utils/handle-error', () => ({
			handleError: jest.fn(),
		}));

		RUN_MODE = process.env.RUN_MODE;
	});

	afterEach(() => {
		process.chdir(cwd);

		process.env.RUN_MODE = RUN_MODE;
	});

	test('runs task', async () => {
		process.env.RUN_MODE = 'dev';

		const dir = path.resolve(__dirname, '__sandbox__/app1/');
		process.chdir(dir);

		await start();

		expect(run.mock.calls).toMatchSnapshot();
	});
});
