import { validateTask } from './validate-task';

describe('validateTask', () => {
	test('handles valid task', () => {
		const result = validateTask('dev');

		expect(result).toMatchSnapshot();
	});

	test('handles undefined task', () => {
		try {
			expect.hasAssertions();
			// @ts-ignore
			validateTask();
		} catch (error) {
			expect(error).toMatchSnapshot();
		}
	});

	test('handles empty task', () => {
		try {
			expect.hasAssertions();
			validateTask('');
		} catch (error) {
			expect(error).toMatchSnapshot();
		}
	});

	test('handles bad input', () => {
		try {
			expect.hasAssertions();
			validateTask(0);
		} catch (error) {
			expect(error).toMatchSnapshot();
		}
	});

	test('handles process.env.NODE_ENV not set', () => {
		const NODE_ENV = process.env.NODE_ENV;
		delete process.env.NODE_ENV;

		try {
			expect.hasAssertions();
			validateTask('dev');
		} catch (error) {
			expect(error).toMatchSnapshot();
		}

		process.env.NODE_ENV = NODE_ENV;
	});

	test('handles process.env.NODE_ENV is set', () => {
		const result = validateTask('dev');

		expect(result).toMatchSnapshot();
	});
});
