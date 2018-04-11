/* @flow */

import log from '../utils/log';
import { runTask } from './run-task';
import { handleError } from '../utils/handle-error';
import { validateTask } from './validate-task';
import { clean } from '../clean/clean';
import { toArray } from '../utils/object-utils';

import type { Task } from '../types.js';

function run(
    taskName: string,
    task: Task,
    ...options: $ReadOnlyArray<*>
): Promise<*> {
    return new Promise((resolve) => {
        /**
         * push to back of stack for correct starting/finishing logging order
         */
        setImmediate(() => {
            const NODE_ENV = process.env.NODE_ENV || 'undefined';
            const logPrefix = `${taskName || 'run'}:${NODE_ENV}`;

            validateTask(taskName);

            const { time: start } = log.info(logPrefix, 'Starting...');

            let realTask = task;

            /**
             * TODO: remove any type and fix any flow errors
             */
            let realOptions: any = options;

            /**
             * Internal clean task is an object not a function
             *
             * TODO: Handle custom clean function
             */
            if (taskName === 'clean') {
                realTask = clean;

                realOptions = task;
            }

            const runningTask = runTask(realTask, ...toArray(realOptions))
                .then((taskResult) => {
                    // eslint-disable-next-line promise/param-names
                    return new Promise((innerResolve) => {
                        process.nextTick(() => {
                            const end = new Date();
                            const time = end.getTime() - start.getTime();
                            log.info(logPrefix, `Finished after ${time} ms`);

                            innerResolve(taskResult);
                        });
                    });
                })
                .catch((error) => {
                    return handleError({
                        error,
                        logPrefix,
                        startTime: start,
                    });
                });

            resolve(runningTask);
        });
    });
}

export { run };
