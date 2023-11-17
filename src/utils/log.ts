/* eslint-disable no-console */

import { Instance as Chalk, Options as ChalkOptions } from 'chalk';

const chalkOptions: ChalkOptions = {};
const supportsColor =
	process.env.PATH !== undefined
		? process.env.PATH.includes('Sourcetree.app')
		: true;

if (supportsColor === false) {
	chalkOptions.level = 0;
}

const {
	//
	bgBlue,
	bgGreen,
	bgRed,
	bgYellow,
	gray,
	white,
} = new Chalk({ level: 2 });

const addZero = (time: number): string => {
	if (time < 10) {
		return `0${time.toString()}`;
	}

	return time.toString();
};

interface Time {
	time: Date;
	message: string;
}

function getTime(): Time {
	const now = new Date();
	const hours = addZero(now.getHours());
	const minutes = addZero(now.getMinutes());
	const seconds = addZero(now.getSeconds());

	const timeFormatted = `${hours}:${minutes}:${seconds}`;
	return {
		time: now,
		message: `[${gray(timeFormatted)}]`,
	};
}

type ConsoleTypes = 'info' | 'warn' | 'error';

function print(
	messages: unknown[],
	format = '\b',
	type: ConsoleTypes = 'info',
): Time {
	const time = getTime();
	const meta = `${time.message} ${format}`;

	const coloredMessages = messages.map((message) => {
		return white(message);
	});

	console[type](meta, ...coloredMessages);

	return time;
}

function info(...messages: unknown[]): Time {
	const format = `${bgBlue(white('Info'))}${gray(':')}`;
	return print(messages, format, 'info');
}

const log = info;

function success(...messages: unknown[]): Time {
	const format = `${bgGreen(white('Success'))}${gray(':')}`;
	return print(messages, format, 'info');
}

function error(...messages: unknown[]): Time {
	const format = `${bgRed(white('Error'))}${gray(':')}`;
	return print(messages, format, 'error');
}

function warn(...messages: unknown[]): Time {
	const format = `${bgYellow(white('Warning'))}${gray(':')}`;
	return print(messages, format, 'warn');
}

// eslint-disable-next-line import/no-default-export,import/no-anonymous-default-export
export default { error, info, log, print, success, warn };
