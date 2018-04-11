/* @flow */

/* eslint-disable no-throw-literal */

import execa from 'execa';

async function runShellCommand(command: string) {
    const [filename, ...args] = command.split(' ');

    const runningCommand = execa(filename, args, {
        env: { FORCE_COLOR: true },
    });

    const logStream = runningCommand.stdout;
    const logErrorStream = runningCommand.stderr;

    /**
     * Log all output to console
     */
    logStream.pipe(process.stdout);
    logErrorStream.pipe(process.stderr);

    try {
        await runningCommand;
    } catch (error) {
        /**
         * An error stack is not relevant here because it is an external command
         *
         * More detailed command not found error
         */
        if (error.code === 'ENOENT') {
            throw {
                message: `Command not found: ${error.cmd}`,
                exitCode: 1,
            };
        }

        const code = error.code;
        const exitCode = code === 0 || code ? parseInt(code, 10) : 1;

        throw {
            message: `Command failed: ${error.cmd}`,
            exitCode,
        };
    }
}

export { runShellCommand };
