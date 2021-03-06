import type { CustomError } from '../types';
import log from './log';
import { toArray } from './object-utils';

type Errors = Error | CustomError | string;

type HandleError = Readonly<{
	error: Errors | readonly Errors[];
	logPrefix: string;
	startTime?: Date;
}>;

function isCustomError(error: any): error is CustomError {
	// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
	return typeof error === 'object' && error.exitCode !== undefined;
}

function getExitCode(errors: readonly Errors[]): number {
	// Use reduce because it works better with typescript types
	const codes = errors.reduce((acc: number[], error) => {
		if (!isCustomError(error)) {
			return acc;
		}

		const exitCode = error.exitCode;

		/**
		 * remove undefined and duplicate exit codes
		 */
		if (typeof exitCode !== 'number' || acc.includes(exitCode)) {
			return acc;
		}

		return [...acc, exitCode];
	}, []);

	/**
	 * By default, exit with error code 1
	 */
	if (codes.length === 0) {
		return 1;
	}

	/**
	 * Only allow 0 exit code if it is the only exit code
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

function handleError(args: HandleError): Promise<void> {
	return new Promise((resolve) => {
		const { error, logPrefix, startTime } = args;
		/**
		 * Wrap in nextTick to immediately cancel any pending tasks.
		 */
		process.nextTick(() => {
			const normalizedError = toArray(error);

			const exitCode = getExitCode(normalizedError);

			normalizedError.forEach((err) => {
				if (
					typeof err === 'object' &&
					err !== null &&
					Array.isArray(err) === false
				) {
					let message;
					if ((err as Error).stack !== undefined) {
						message = (err as Error).stack;
					} else if ((err as Error).message !== undefined) {
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

			// eslint-disable-next-line no-process-exit
			process.exit(exitCode);
			resolve();
		});
	});
}

export { getExitCode, handleError };
