import { PackageJson } from '../types';

function removeNullValues(packageJson: PackageJson): PackageJson {
    const removeNull = (object: { [key: string]: unknown }): PackageJson => {
        return Object.keys(object).reduce((acc, key) => {
            let value = object[key];

            if (value === null) {
                return acc;
            }

            if (
                typeof value === 'object' &&
                Array.isArray(value) === false &&
                value !== null
            ) {
                value = removeNull(value);
            }

            return {
                ...acc,
                [key]: value,
            };
        }, {});
    };

    const result = removeNull(packageJson);

    return result;
}

export { removeNullValues };
