import Joi from 'joi';

function validateTask<T>(task: T) {
    const taskValid = Joi.string()
        .required()
        .min(1)
        .label('task')
        .validate(task);

    if (taskValid.error) {
        throw new Error(taskValid.error.annotate());
    }

    const nodeEnvValid = Joi.string()
        .required()
        .min(1)
        .label('process.env.NODE_ENV')
        .validate(process.env.NODE_ENV);

    if (nodeEnvValid.error) {
        throw new Error(nodeEnvValid.error.annotate());
    }
}

export { validateTask };
