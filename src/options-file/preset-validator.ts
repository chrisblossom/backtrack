import Joi from '@hapi/joi';
import { BacktrackConfig } from '../types';
import { packageJsonSchema } from './package-json-schema';

const copyFilesSchema = Joi.object({
	src: Joi.string().required(),
	dest: Joi.string().required(),
	allowChanges: Joi.boolean(),
	ignoreUpdates: Joi.boolean(),
});

const filesOptionsSchema = Joi.object({
	skip: Joi.array().items(Joi.string()).single(true),

	allowChanges: [
		//
		Joi.array().items(Joi.string()).single(true),
		Joi.boolean(),
	],
	ignoreUpdates: [
		Joi.array().items(Joi.string()).single(true),
		Joi.boolean(),
	],

	makeDirs: Joi.array().items(Joi.string()).single(true),
});

const filesSchema = Joi.array()
	.items(copyFilesSchema, filesOptionsSchema)
	.single(true)
	.unique()
	.options({
		allowUnknown: false,
	})
	.label('files');

const cmdType = Joi.string().label('cmd');
const fnType = Joi.func().label('function');
const objType = Joi.object({
	name: Joi.string().required(),
	task: [
		fnType.required(),
		cmdType.required(),
	],
});

const functionLifecycles = Joi.array()
	.items([
		cmdType,
		fnType,
		objType,
		Joi.array().items(cmdType, fnType, objType),
	])
	.single(true);

const cleanCopySchema = Joi.array()
	.items(
		Joi.object({
			dest: Joi.string().required(),
			src: Joi.string().required(),
			hash: Joi.boolean(),
		}),
	)
	.single(true)
	.min(1);

const cleanSchema = Joi.array()
	.items(
		Joi.object({
			del: Joi.array().items(Joi.string()).single(true).min(1),
			makeDirs: Joi.array().items(Joi.string()).single(true).min(1),
			copy: cleanCopySchema,
		}).min(1),
	)
	.single(true)
	.unique()
	.options({
		allowUnknown: false,
	})
	.label('clean');

const configSchema = Joi.object({})
	.options({
		allowUnknown: true,
	})
	.label('config');

const resolveSchema = Joi.object().pattern(/.*/, Joi.string()).label('resolve');

function generateSchema(lifecycles: BacktrackConfig): Joi.ObjectSchema {
	const managedLifecycles = {
		clean: cleanSchema,
		files: filesSchema,
		packageJson: packageJsonSchema,
		config: configSchema,
		resolve: resolveSchema,
	};

	/**
	 * Although all lifecycles can be false to be disabled, they are removed before validation
	 * Do not not test for this because it will return poor error messages
	 */
	type ManagedLifecycles = keyof typeof managedLifecycles;
	const allLifeCyclesKeys = Object.keys(lifecycles) as ManagedLifecycles[];
	const allLifecycles = allLifeCyclesKeys.reduce(
		(acc, lifecycle: ManagedLifecycles) => {
			const rule = managedLifecycles[lifecycle]
				? managedLifecycles[lifecycle]
				: functionLifecycles.label(lifecycle);

			return {
				...acc,
				[lifecycle]: [rule],
			};
		},
		{},
	) as Record<ManagedLifecycles, Joi.Schema>;

	const result = Joi.object({
		...allLifecycles,
		presets: Joi.array()
			.items(
				Joi.string(),
				Joi.array().ordered(Joi.string().required(), Joi.object()),
			)

			.single(true)
			.unique()
			.label('presets'),
	}).required();

	return result;
}

interface Args {
	value: BacktrackConfig;
}

function presetValidator({ value = {} }: Args = { value: {} }): void {
	const schema = generateSchema(value);
	const isValid = Joi.validate(value, schema);

	if (isValid.error) {
		throw new Error(isValid.error.annotate());
	}
}

export { presetValidator };
