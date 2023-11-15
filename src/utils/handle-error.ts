import { ExecaError } from 'execa';
import { ErrorWithProcessExitCode } from './error-with-process-exit-code';
import log from './log';
import { toArray } from './object-utils';

type Errors = Error | ExecaError | ErrorWithProcessExitCode | string;

function errorHasExitCode(
	error: unknown,
): error is Error & { exitCode: number } {
	if (typeof error !== 'object' || error === null) {
		return false;
	}

	// @ts-expect-error TS2339 - Property 'exitCode' does not exist on type 'Error | string'.
	return typeof error.exitCode === 'number';
}

function getExitCode(errors: Errors[]): number {
	// Use reduce because it works better with typescript types
	const codes = errors.reduce((acc: number[], error) => {
		if (!errorHasExitCode(error)) {
			return acc;
		}

		const exitCode = error.exitCode;

		/**
		 * remove undefined and duplicate exit codes
		 */
		if (acc.includes(exitCode) === true) {
			return acc;
		}

		return [
			...acc,
			exitCode,
		];
	}, []);

	/**
	 * By default, exit with code "1"
	 */
	if (codes.length === 0) {
		return 1;
	}

	/**
	 * Only allow "0" exit code if it is the only exit code
	 */
	if (codes.length === 1) {
		return codes[0];
	}

	const removeZeros = codes.filter((code) => {
		return code !== 0;
	});

	/**
	 * Exit with the first error code provided
	 */
	return removeZeros[0];
}

interface HandleError {
	error: Errors | Errors[];
	logPrefix: string;
	startTime?: Date;
}

async function handleError(args: HandleError): Promise<void> {
	return new Promise((resolve) => {
		const { error, logPrefix, startTime } = args;
		/**
		 * Wrap in nextTick to immediately cancel any pending tasks.
		 */
		process.nextTick(() => {
			const normalizedError = toArray(error);

			const exitCode = getExitCode(normalizedError);

			normalizedError.forEach((err) => {
				if (typeof err === 'object' && Array.isArray(err) === false) {
					let message;
					if (err.stack) {
						message = err.stack;
					} else if (err.message) {
						message = err.message;
					} else {
						message = err;
					}

					log.error(logPrefix, message);
				} else {
					log.error(logPrefix, err);
				}
			});

			if (startTime !== undefined) {
				const endTime = new Date();
				const time = endTime.getTime() - startTime.getTime();
				log.error(logPrefix, `Finished after ${time.toString()} ms`);
			}

			// eslint-disable-next-line n/no-process-exit
			process.exit(exitCode);
			resolve();
		});
	});
}

export { getExitCode, handleError };
