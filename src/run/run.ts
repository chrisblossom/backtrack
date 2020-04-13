/* eslint-disable no-await-in-loop */

import log from '../utils/log';
import { handleError } from '../utils/handle-error';
import { clean } from '../clean/clean';
import { toArray } from '../utils/object-utils';
import { AllTaskTypes, Task } from '../types';
import { validateTask } from './validate-task';
import { runShellCommand } from './run-shell-command';

function checkForRun(task: AllTaskTypes, ...options: any[]) {
	if (typeof task === 'object') {
		if (typeof task.name !== 'string' || task.name === '') {
			throw new Error(`'name' is required for run syntax`);
		}

		if (!task.task) {
			throw new Error(`'task' is required for run syntax`);
		}

		// eslint-disable-next-line @typescript-eslint/no-use-before-define
		return run(task.name, task.task, ...options);
	}
	/**
	 * Handle shell commands
	 */
	if (typeof task === 'string') {
		return runShellCommand(task);
	}

	// eslint-disable-next-line @typescript-eslint/no-unsafe-return
	return task(...options);
}

function isSingleTask(task: any): task is AllTaskTypes {
	return Array.isArray(task) === false;
}

async function runTask(
	task: Task,
	...options: any[]
): Promise<readonly unknown[]> {
	/**
	 * Handle single tasks
	 */
	if (isSingleTask(task)) {
		const result = await checkForRun(task, ...options);

		// eslint-disable-next-line @typescript-eslint/no-unsafe-return
		return [result];
	}

	const result = [];
	for (const currentTask of task) {
		/**
		 * Handle concurrent tasks as an array
		 */
		if (isSingleTask(currentTask)) {
			const taskDone = await checkForRun(currentTask, ...options);

			result.push(taskDone);
		} else {
			const taskDone = await Promise.all(
				currentTask.map((task1) => {
					// eslint-disable-next-line @typescript-eslint/no-unsafe-return
					return checkForRun(task1, ...options);
				}),
			);

			result.push(...taskDone);
		}
	}

	// eslint-disable-next-line @typescript-eslint/no-unsafe-return
	return result;
}

function run(
	taskName: string,
	task: Task,
	...options: unknown[]
): Promise<unknown> {
	return new Promise((resolve) => {
		/**
		 * push to back of stack for correct starting/finishing logging order
		 */
		setImmediate(() => {
			const NODE_ENV = process.env.NODE_ENV ?? 'undefined';
			const logPrefix = `${taskName || 'run'}:${NODE_ENV}`;

			validateTask(taskName);

			const { time: start } = log.info(logPrefix, 'Starting...');

			let realTask = task;

			/**
			 * TODO: remove 'unknown' type and fix any errors
			 */
			let realOptions: unknown = options;

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
							log.info(
								logPrefix,
								`Finished after ${time.toString()} ms`,
							);

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

export { run, runTask };
