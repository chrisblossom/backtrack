import {
	isArray,
	isBoolean,
	isDate,
	isFunction,
	isNaN,
	isNull,
	isNumber,
	isPlainObject,
	isRegExp,
	isString,
	isUndefined,
} from 'lodash';

type Types =
	| 'array'
	| 'boolean'
	| 'date'
	| 'function'
	| 'number'
	| 'plain object'
	| 'promise'
	| 'string'
	| 'undefined'
	| 'null'
	| 'NaN'
	| 'regex'
	| 'unknown';

function getType(value?: any): Types {
	if (isPlainObject(value)) {
		return 'plain object';
	}

	if (isArray(value)) {
		return 'array';
	}

	if (isBoolean(value)) {
		return 'boolean';
	}

	if (isFunction(value)) {
		return 'function';
	}

	if (isString(value)) {
		return 'string';
	}

	if (isNaN(value)) {
		return 'NaN';
	}

	if (isNumber(value)) {
		return 'number';
	}

	if (isDate(value)) {
		return 'date';
	}

	if (Promise.resolve(value) === value) {
		return 'promise';
	}

	if (isNull(value)) {
		return 'null';
	}

	if (isUndefined(value)) {
		return 'undefined';
	}

	if (isRegExp(value)) {
		return 'regex';
	}

	return 'unknown';
}

export { getType };
