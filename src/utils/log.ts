/* eslint-disable @typescript-eslint/explicit-module-boundary-types,no-console */

import { bgBlue, bgGreen, bgRed, bgYellow, gray, white } from 'chalk';

function getTime() {
	const addZero = (time: number) => {
		if (time < 10) {
			return `0${time.toString()}`;
		}

		return time.toString();
	};

	const now = new Date();
	const hours = addZero(now.getHours());
	const minutes = addZero(now.getMinutes());
	const seconds = addZero(now.getSeconds());

	return {
		time: now,
		message: `[${gray(`${hours}:${minutes}:${seconds}`)}]`,
	};
}

type ConsoleTypes = 'info' | 'warn' | 'error';

function print(
	messages: unknown[],
	format = '\b',
	type: ConsoleTypes = 'info',
) {
	const time = getTime();
	const meta = `${time.message} ${format}`;

	const coloredMessages = messages.map((message) => {
		return white(message);
	});

	console[type](meta, ...coloredMessages);

	return time;
}

function info(...messages: unknown[]) {
	const format = `${bgBlue(white('Info'))}${gray(':')}`;
	return print(messages, format, 'info');
}

const log = info;

function success(...messages: unknown[]) {
	const format = `${bgGreen(white('Success'))}${gray(':')}`;
	return print(messages, format, 'info');
}

function error(...messages: unknown[]) {
	const format = `${bgRed(white('Error'))}${gray(':')}`;
	return print(messages, format, 'error');
}

function warn(...messages: unknown[]) {
	const format = `${bgYellow(white('Warning'))}${gray(':')}`;
	return print(messages, format, 'warn');
}

// eslint-disable-next-line import/no-default-export
export default { error, info, log, print, success, warn };
