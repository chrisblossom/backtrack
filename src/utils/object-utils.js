/* @flow */

import { cloneDeep, isPlainObject, mergeWith, toPath } from 'lodash';
import deepKeys from 'deep-keys';

function toArray<T>(value: $ReadOnlyArray<T> | ?T): $ReadOnlyArray<T> {
    if (value === undefined || value === null) {
        return [];
    }

    if (Array.isArray(value)) {
        return value;
    }

    return [value];
}

function mapObjectKeyNames(object: ?{}) {
    if (!object || Object.keys(object).length === 0) {
        return [];
    }

    const keyPaths: $ReadOnlyArray<string> = deepKeys(object);

    const result = keyPaths.map((path) => {
        /**
         * deep-keys escapes periods (.) in keys with \\.
         *
         * Convert to array so lodash can handle correctly
         *
         * https://github.com/lodash/lodash/issues/3530
         */
        const escapePeriodsInKeys = path.replace(/\\./g, '@!@%@!');
        const escaped = escapePeriodsInKeys.split('.').map((k) => {
            return k.replace(/@!@%@!/g, '.');
        });

        return escaped;
    });

    return result;
}

function getParentsFromPath(path: $ReadOnlyArray<string>) {
    const basePath = toPath(path);

    const result = basePath
        .reduce((acc, subPath, index) => {
            if (index === 0) {
                return [[subPath]];
            }

            const previousSubPath = toArray(acc[index - 1]);
            const joinWithPrevious = [...previousSubPath, subPath];

            return [...acc, joinWithPrevious];
        }, [])
        .reverse();

    return result;
}

function mergeDeep(...objects: *) {
    const [first, ...rest] = objects;

    /**
     * lodash.merge mutates first object. Perform a deep copy to prevent this
     */
    const firstCopy = cloneDeep(first);

    return mergeWith(firstCopy, ...rest, (objValue, srcValue) => {
        if (Array.isArray(objValue)) {
            return objValue.concat(srcValue);
        }

        if (isPlainObject(objValue)) {
            return mergeDeep(objValue, srcValue);
        }

        return srcValue;
    });
}

function hasProperty(object: *, property: string): boolean {
    return Object.prototype.hasOwnProperty.call(object, property);
}

export {
    getParentsFromPath,
    hasProperty,
    mapObjectKeyNames,
    mergeDeep,
    toArray,
};
