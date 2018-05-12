/* @flow */

import Joi from 'joi';
import { packageJsonSchema } from './package-json-schema';

import type { Preset } from '../types.js';

const copyFilesSchema = Joi.object({
    src: Joi.string().required(),
    dest: Joi.string().required(),
    allowChanges: Joi.boolean(),
    ignoreUpdates: Joi.boolean(),
});

const filesOptionsSchema = Joi.object({
    skip: Joi.array()
        .items(Joi.string())
        .single(true),

    allowChanges: [
        Joi.array()
            .items(Joi.string())
            .single(true),
        Joi.boolean(),
    ],
    ignoreUpdates: [
        Joi.array()
            .items(Joi.string())
            .single(true),
        Joi.boolean(),
    ],

    makeDirs: Joi.array()
        .items(Joi.string())
        .single(true),
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
    task: [fnType.required(), cmdType.required()],
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
            del: Joi.array()
                .items(Joi.string())
                .single(true)
                .min(1),
            makeDirs: Joi.array()
                .items(Joi.string())
                .single(true)
                .min(1),
            copy: cleanCopySchema,
        }).min(1),
    )
    .single(true)
    .unique()
    .options({
        allowUnknown: false,
    })
    .label('clean');

const configSchema = Joi.array()
    .items(
        Joi.object({}).options({
            allowUnknown: true,
        }),
    )
    .single(true)
    .label('config');

const resolveSchema = Joi.object()
    .pattern(/.*/, Joi.string())
    .label('resolve');

function generateSchema(lifecycles: Preset) {
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
    const allLifecycles = Object.keys(lifecycles).reduce((acc, lifecycle) => {
        // $FlowIgnore
        const rule = managedLifecycles[lifecycle]
            ? managedLifecycles[lifecycle]
            : functionLifecycles.label(lifecycle);

        return {
            ...acc,
            [lifecycle]: [rule],
        };
    }, {});

    const result = Joi.object({
        presets: Joi.array()
            .items(
                // eslint-disable-next-line arrow-body-style
                Joi.lazy(() => result)
                    .description('preset schema')
                    .label('presets'),
            )
            .single(true)
            .unique()
            .label('presets'),

        ...allLifecycles,
    }).required();

    return result;
}

// eslint-disable-next-line flowtype/require-exact-type
type Args = {
    value: Preset,
};

function presetValidator({ value = {} }: Args = {}) {
    const schema = generateSchema(value);
    const isValid = Joi.validate(value, schema);

    if (isValid.error) {
        throw new Error(isValid.error.annotate());
    }
}

export { presetValidator };
