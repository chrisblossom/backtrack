/* eslint-disable no-throw-literal */

import execa from 'execa';

async function runShellCommand(command: string) {
	const runningCommand = execa.shell(
		command,
		// @ts-ignore
		{
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
		},
	);

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
			throw {
				message: `Command not found: ${error.cmd}`,
				exitCode: 1,
			};
		}

		const code = error.code;
		const exitCode = code === 0 || code ? code : 1;

		throw {
			message: `Command failed: ${error.cmd}`,
			exitCode,
		};
	}
}

export { runShellCommand };
