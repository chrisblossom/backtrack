/* @flow */

import log from './log';
import { toArray } from './object-utils';
import type { CustomError } from '../types.js';

type Errors = Error | CustomError | string;

type HandleError = {|
    error: Errors | $ReadOnlyArray<Errors>,
    logPrefix: string,
    startTime?: Date,
|};

function getExitCode(errors: $ReadOnlyArray<Errors>): number {
    // Use reduce because it works better with flow types
    const codes = errors.reduce((acc, error) => {
        if (typeof error === 'string' || error.exitCode === undefined) {
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
                    const message = err.stack || err.message || err;

                    log.error(logPrefix, message);
                } else if (err) {
                    log.error(logPrefix, err);
                }
            });

            if (startTime) {
                const endTime = new Date();
                const time = endTime.getTime() - startTime.getTime();
                log.error(logPrefix, `Finished after ${time} ms`);
            }

            process.exit(exitCode);
            resolve();
        });
    });
}

export { getExitCode, handleError };
