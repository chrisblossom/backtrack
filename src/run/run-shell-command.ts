import execa from 'execa';
import { ErrorWithProcessExitCode } from '../utils/error-with-process-exit-code';

async function runShellCommand(command: string): Promise<void> {
	const runningCommand = execa.shell(command, {
		env: { FORCE_COLOR: 'true' },
		// https://nodejs.org/api/child_process.html#child_process_options_stdio
		stdio: [
			// stdin - forward keyboard input
			process.stdin,
			// stdout
			'pipe',
			// stderr
			'pipe',
		],
	});

	const logStream = runningCommand.stdout;
	const logErrorStream = runningCommand.stderr;

	/**
	 * Log all output to console
	 */
	if (logStream !== null) {
		logStream.pipe(process.stdout);
	}

	if (logErrorStream !== null) {
		logErrorStream.pipe(process.stderr);
	}

	try {
		await runningCommand;
	} catch (err: unknown) {
		const error = err as execa.ExecaError;

		/**
		 * An error stack is not relevant here because it is an external command
		 *
		 * More detailed command not found error
		 */
		// @ts-ignore
		if (error.code === 'ENOENT') {
			const message = `Command not found: ${error.cmd}`;
			const exitCode = 1;

			throw new ErrorWithProcessExitCode(message, exitCode);
		}

		const code = error.code;
		const exitCode = code === 0 || code ? code : 1;
		const message = `Command failed: ${error.cmd}`;

		throw new ErrorWithProcessExitCode(message, exitCode);
	}
}

export { runShellCommand };
