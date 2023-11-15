import type { ExecaError } from 'execa';
import { runShellCommand } from './run-shell-command';

describe('runShellCommand', () => {
	const backtrackTestEnv = process.env.BACKTRACK_TEST_ENVIRONMENT;

	beforeEach(() => {
		process.env.BACKTRACK_TEST_ENVIRONMENT = 'test';
	});

	afterEach(() => {
		process.env.BACKTRACK_TEST_ENV = backtrackTestEnv;
	});

	test('handles shell command', async () => {
		const task = "ls | grep -i -E 'node_modules|package.json'";
		const result = await runShellCommand(task);

		const expectedStdout = 'node_modules\npackage.json';
		expect(result).toEqual({
			all: undefined,
			command: task,
			escapedCommand: `"${task}"`,
			exitCode: 0,
			failed: false,
			isCanceled: false,
			killed: false,
			stderr: '',
			stdout: expectedStdout,
			timedOut: false,
		});
	});

	test('command failed', async () => {
		const task = 'node --option-does-not-exist';

		let error;
		try {
			await runShellCommand(task);
		} catch (e) {
			error = e as ExecaError;
		} finally {
			expect(error).toMatchInlineSnapshot(`
[Error: Command failed with exit code 9: node --option-does-not-exist
node: bad option: --option-does-not-exist]
`);
		}
	});

	test('command not found', async () => {
		const task = 'command-does-not-exist-321 --version';

		let error;
		try {
			await runShellCommand(task);
		} catch (e) {
			error = e as ExecaError;
		} finally {
			expect(error).toMatchInlineSnapshot(`
[Error: Command failed with exit code 127: command-does-not-exist-321 --version
/bin/sh: command-does-not-exist-321: command not found]
`);
		}
	});
});
