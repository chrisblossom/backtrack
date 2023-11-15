import execa from 'execa';

async function runShellCommand(
	command: string,
): Promise<execa.ExecaChildProcess> {
	const runningCommand = execa(command, {
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
		preferLocal: true,
		shell: true,
	});

	const logStream = runningCommand.stdout;
	const logErrorStream = runningCommand.stderr;

	/**
	 * Log all output to console if not in test environment
	 */
	const backtrackTestEnv = process.env.BACKTRACK_TEST_ENVIRONMENT ?? '';
	if (backtrackTestEnv !== 'test') {
		if (logStream !== null) {
			logStream.pipe(process.stdout);
		}

		if (logErrorStream !== null) {
			logErrorStream.pipe(process.stderr);
		}
	}

	try {
		const result = await runningCommand;

		return result;
	} catch (err: unknown) {
		const error = err as execa.ExecaError;

		/**
		 * More detailed command not found error
		 */
		// @ts-expect-error - execa.ExecaError can throw an error with a code of ENOENT
		if (error.code === 'ENOENT') {
			error.message += ' - command not found';
		}

		throw error;
	}
}

export { runShellCommand };
