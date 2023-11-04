import { ErrorWithProcessExitCode } from './error-with-process-exit-code';
import { getExitCode } from './handle-error';

describe('getExitCode', () => {
	test('single exit 2', () => {
		const errors = [
			new ErrorWithProcessExitCode('', 2),
		];

		const exitCode = getExitCode(errors);

		expect(exitCode).toEqual(2);
	});

	test('multiple exit codes with 0 starting', () => {
		const errors = [
			new ErrorWithProcessExitCode('', 0),
			new ErrorWithProcessExitCode('', 2),
		];

		const exitCode = getExitCode(errors);
		expect(exitCode).toEqual(2);
	});

	test('defaults to 1', () => {
		const errors = [
			// @ts-expect-error
			new ErrorWithProcessExitCode(''),
		];

		const exitCode = getExitCode(errors);
		expect(exitCode).toEqual(1);
	});

	test('works with 0', () => {
		const errors = [new ErrorWithProcessExitCode('', 0)];

		const exitCode = getExitCode(errors);
		expect(exitCode).toEqual(0);
	});

	test('works with two 0', () => {
		const errors = [
			new ErrorWithProcessExitCode('', 0),
			new ErrorWithProcessExitCode('', 0),
		];

		const exitCode = getExitCode(errors);
		expect(exitCode).toEqual(0);
	});

	test('works with undefined', () => {
		const errors = [
			// @ts-expect-error
			new ErrorWithProcessExitCode(''),
			new ErrorWithProcessExitCode('', 0),
			new ErrorWithProcessExitCode('', 2),
		];

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
			new ErrorWithProcessExitCode('', 2),
		];

		const exitCode = getExitCode(errors);
		expect(exitCode).toEqual(2);
	});
});
