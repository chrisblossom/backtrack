/* @flow */

/* eslint no-console:0 */

import { bgBlue, bgGreen, bgRed, bgYellow, gray, white } from 'chalk';

function getTime() {
    const addZero = (time) => {
        if (time < 10) {
            return `0${time}`;
        }

        return time;
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

function print(
    messages: $ReadOnlyArray<*>,
    format: string = '\b',
    type: string = 'info',
) {
    const time = getTime();
    const meta = `${time.message} ${format}`;

    const coloredMessages = messages.map((message) => {
        return white(message);
    });

    console[type](meta, ...coloredMessages);

    return time;
}

function info(...messages: $ReadOnlyArray<*>) {
    const format = `${bgBlue(white('Info'))}${gray(':')}`;
    return print(messages, format, 'info');
}
const log = info;

function success(...messages: $ReadOnlyArray<*>) {
    const format = `${bgGreen(white('Success'))}${gray(':')}`;
    return print(messages, format, 'info');
}

function error(...messages: $ReadOnlyArray<*>) {
    const format = `${bgRed(white('Error'))}${gray(':')}`;
    return print(messages, format, 'error');
}

function warn(...messages: $ReadOnlyArray<*>) {
    const format = `${bgYellow(white('Warning'))}${gray(':')}`;
    return print(messages, format, 'warn');
}

// eslint-disable-next-line import/no-default-export
export default { error, info, log, print, success, warn };
