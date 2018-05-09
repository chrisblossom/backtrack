/* @flow */

import { isPlainObject } from 'lodash';
import type { PackageJson } from '../types';

function removeNullValues(
    packageJson: {} /* flow errors with PackageJson */,
): PackageJson {
    const removeNull = (object) => {
        return Object.keys(object).reduce((acc, key) => {
            let value = object[key];

            if (value === null) {
                return acc;
            }

            if (isPlainObject(value)) {
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
