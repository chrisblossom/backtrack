import { cloneDeep, mergeWith, toPath } from 'lodash';
import deepKeys from 'deep-keys';

// source: https://github.com/sindresorhus/is-plain-obj
// copy due to ESM-only package
function isPlainObject<Value>(
	value: unknown,
): value is Record<PropertyKey, Value> {
	if (typeof value !== 'object' || value === null) {
		return false;
	}

	const prototype = Object.getPrototypeOf(value) as object;
	return (
		(prototype === null ||
			prototype === Object.prototype ||
			Object.getPrototypeOf(prototype) === null) &&
		!(Symbol.toStringTag in value) &&
		!(Symbol.iterator in value)
	);
}

function objectHasKey<O extends object>(
	obj: O,
	key: keyof any,
): key is keyof O {
	return key in obj;
}

function isReadonlyArray<T>(value: unknown): value is readonly T[] {
	return Array.isArray(value);
}

// removes readonly from array
function toArray<T>(value?: readonly T[] | T): T[] {
	if (value == null) {
		return [];
	}

	if (isReadonlyArray(value)) {
		return [...value];
	}

	return [value];
}

function mapObjectKeyNames(object: Record<string, unknown> = {}): string[][] {
	if (Object.keys(object).length === 0) {
		return [];
	}

	const keyPaths: readonly string[] = deepKeys(object);

	const result = keyPaths.map((path: string) => {
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

function getParentsFromPath(path: readonly string[]): string[][] {
	const basePath = toPath(path);

	const result = basePath
		.reduce((acc: string[][], subPath: string, index) => {
			if (index === 0) {
				return [[subPath]];
			}

			const previousSubPath = toArray(acc[index - 1]);
			const joinWithPrevious = [
				...previousSubPath,
				subPath,
			];

			return [
				...acc,
				joinWithPrevious,
			];
		}, [])
		.reverse();

	return result;
}

// TODO: Replace with https://github.com/voodoocreation/ts-deepmerge
function mergeDeep<T>(...objects: Record<string, unknown>[]): T {
	const [
		first,
		...rest
	] = objects;

	/**
	 * lodash.merge mutates first object. Perform a deep copy to prevent this
	 */
	const firstCopy = cloneDeep(first);

	/* eslint-disable @typescript-eslint/no-unsafe-return */
	return mergeWith(firstCopy, ...rest, (objValue: any, srcValue: any) => {
		if (Array.isArray(objValue)) {
			return objValue.concat(srcValue);
		}

		if (isPlainObject(objValue)) {
			return mergeDeep(objValue, srcValue);
		}

		return srcValue;
	});
	/* eslint-enable @typescript-eslint/no-unsafe-return */
}

export {
	getParentsFromPath,
	objectHasKey,
	isPlainObject,
	isReadonlyArray,
	mapObjectKeyNames,
	mergeDeep,
	toArray,
};
