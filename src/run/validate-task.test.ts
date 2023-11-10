import { validateTask } from './validate-task';

describe('validateTask', () => {
	test('handles valid task', () => {
		expect(() => {
			validateTask('dev');
		}).not.toThrow();
	});

	test('handles undefined task', () => {
		let error;
		try {
			// @ts-expect-error
			validateTask();
		} catch (e) {
			error = e;
		} finally {
			expect(error).toMatchInlineSnapshot(`[Error: "task" is required]`);
		}
	});

	test('handles empty task', () => {
		let error;
		try {
			validateTask('');
		} catch (e) {
			error = e;
		} finally {
			expect(error).toMatchInlineSnapshot(
				`[Error: "task" is not allowed to be empty]`,
			);
		}
	});

	test('handles bad input', () => {
		let error;
		try {
			validateTask(0);
		} catch (e) {
			error = e;
		} finally {
			expect(error).toMatchInlineSnapshot(
				`[Error: "task" must be a string]`,
			);
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
			expect(error).toMatchInlineSnapshot(
				`[Error: "process.env.NODE_ENV" is required]`,
			);
		}

		process.env.NODE_ENV = NODE_ENV;
	});

	test('handles process.env.NODE_ENV is set', () => {
		expect(() => {
			validateTask('dev');
		}).not.toThrow();
	});
});
