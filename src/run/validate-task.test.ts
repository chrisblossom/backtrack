import { validateTask } from './validate-task';

describe('validateTask', () => {
	test('handles valid task', () => {
		const result = validateTask('dev');

		expect(result).toMatchSnapshot();
	});

	test('handles undefined task', () => {
		let error;
		try {
			// @ts-ignore
			validateTask();
		} catch (e) {
			error = e;
		} finally {
			expect(error).toMatchSnapshot();
		}
	});

	test('handles empty task', () => {
		let error;
		try {
			validateTask('');
		} catch (e) {
			error = e;
		} finally {
			expect(error).toMatchSnapshot();
		}
	});

	test('handles bad input', () => {
		let error;
		try {
			validateTask(0);
		} catch (e) {
			error = e;
		} finally {
			expect(error).toMatchSnapshot();
		}
	});

	test('handles process.env.NODE_ENV not set', () => {
		const NODE_ENV = process.env.NODE_ENV;
		delete process.env.NODE_ENV;

		let error;
		try {
			validateTask('dev');
		} catch (e) {
			error = e;
		} finally {
			expect(error).toMatchSnapshot();
		}

		process.env.NODE_ENV = NODE_ENV;
	});

	test('handles process.env.NODE_ENV is set', () => {
		const result = validateTask('dev');

		expect(result).toMatchSnapshot();
	});
});
