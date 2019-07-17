import Joi from '@hapi/joi';
import { packageJsonSchema } from './package-json-schema';

describe('packageJsonSchema', () => {
	test('is valid', () => {
		const managedKeys = {
			scripts: { dev: 'backtrack dev' },
		};

		const isValid = Joi.validate(managedKeys, packageJsonSchema);

		expect(isValid.error).toEqual(null);
	});

	test('is invalid', () => {
		const managedKeys = {
			keywords: 'backtrack name',
		};

		const isValid = Joi.validate(managedKeys, packageJsonSchema);

		expect(isValid.error).toMatchSnapshot();
	});

	test('is valid no managedKeys', () => {
		const managedKeys = {};

		const isValid = Joi.validate(managedKeys, packageJsonSchema);

		expect(isValid.error).toEqual(null);
	});

	test('is valid undefined managedKeys', () => {
		const isValid = Joi.validate(undefined, packageJsonSchema);

		expect(isValid.error).toEqual(null);
	});
});
