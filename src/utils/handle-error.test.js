/* @flow */

import { getExitCode } from './handle-error';

describe('getExitCode', () => {
    test('single exit 2', () => {
        const errors = [{ message: '', exitCode: 2 }];

        const exitCode = getExitCode(errors);

        expect(exitCode).toEqual(2);
    });

    test('multiple exit codes with 0 starting', () => {
        const errors = [
            { message: '', exitCode: 0 },
            { message: '', exitCode: 2 },
        ];

        const exitCode = getExitCode(errors);
        expect(exitCode).toEqual(2);
    });

    test('defaults to 1', () => {
        // $FlowIgnore
        const errors = [{ message: '' }];

        const exitCode = getExitCode(errors);
        expect(exitCode).toEqual(1);
    });

    test('works with 0', () => {
        const errors = [{ message: '', exitCode: 0 }];

        const exitCode = getExitCode(errors);
        expect(exitCode).toEqual(0);
    });

    test('works with two 0', () => {
        const errors = [
            { message: '', exitCode: 0 },
            { message: '', exitCode: 0 },
        ];

        const exitCode = getExitCode(errors);
        expect(exitCode).toEqual(0);
    });

    test('works with undefined', () => {
        const errors = [
            { message: '', exitCode: undefined },
            { message: '', exitCode: 0 },
            { message: '', exitCode: 2 },
        ];

        // $FlowIgnore
        const exitCode = getExitCode(errors);
        expect(exitCode).toEqual(2);
    });

    test('works with normal error object', () => {
        const errors = [new Error('testing')];

        const exitCode = getExitCode(errors);
        expect(exitCode).toEqual(1);
    });

    test('works with string', () => {
        const errors = ['testing'];

        const exitCode = getExitCode(errors);
        expect(exitCode).toEqual(1);
    });

    test('works multiple types', () => {
        const errors = [
            new Error('hello'),
            'testing',
            { message: '', exitCode: 2 },
        ];

        const exitCode = getExitCode(errors);
        expect(exitCode).toEqual(2);
    });
});
