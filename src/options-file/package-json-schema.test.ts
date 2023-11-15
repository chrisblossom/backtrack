import { packageJsonSchema } from './package-json-schema';

describe('packageJsonSchema', () => {
	test('is valid', () => {
		const managedKeys = {
			scripts: { dev: 'backtrack dev' },
		};

		const isValid = packageJsonSchema.validate(managedKeys);

		expect(isValid.error).toEqual(undefined);
	});

	test('is invalid', () => {
		const managedKeys = {
			keywords: 'backtrack name',
		};

		const isValid = packageJsonSchema.validate(managedKeys);

		expect(isValid.error).toMatchSnapshot();
	});

	test('is valid no managedKeys', () => {
		const managedKeys = {};

		const isValid = packageJsonSchema.validate(managedKeys);

		expect(isValid.error).toEqual(undefined);
	});

	test('is valid undefined managedKeys', () => {
		const isValid = packageJsonSchema.validate(undefined);

		expect(isValid.error).toEqual(undefined);
	});
});
