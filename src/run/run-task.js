/* @flow */

/* eslint-disable no-await-in-loop */

import { run } from './run';
import { runShellCommand } from './run-shell-command';
import type { AllTaskTypes, Task } from '../types.js';

function checkForRun(task: AllTaskTypes, ...options: $ReadOnlyArray<*>) {
    if (typeof task === 'object') {
        if (!task.name || !task.task) {
            const missing = !task.name ? 'name' : 'task';
            throw new Error(`'${missing}' is required for run syntax`);
        }

        return run(task.name, task.task, ...options);
    }

    /**
     * Handle shell commands
     */
    if (typeof task === 'string') {
        return runShellCommand(task);
    }

    return task(...options);
}

async function runTask(
    task: Task,
    ...options: $ReadOnlyArray<*>
): Promise<$ReadOnlyArray<*>> {
    /**
     * Handle single tasks
     */
    if (
        typeof task === 'function' ||
        typeof task === 'string' ||
        !Array.isArray(task)
    ) {
        const result = await checkForRun(task, ...options);

        return [result];
    }

    const result = [];
    for (const currentTask of task) {
        /**
         * Handle concurrent tasks as an array
         */
        if (Array.isArray(currentTask)) {
            const taskDone = await Promise.all(
                currentTask.map((t) => {
                    return checkForRun(t, ...options);
                }),
            );

            result.push(...taskDone);
        } else {
            const taskDone = await checkForRun(currentTask, ...options);

            result.push(taskDone);
        }
    }

    return result;
}

export { runTask };
