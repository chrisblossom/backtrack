import { cloneDeep, isPlainObject, mergeWith, toPath } from 'lodash';
import deepKeys from 'deep-keys';

function toArray<T>(value: readonly T[] | T[] | T | null | undefined): T[] {
	if (value === undefined || value === null) {
		return [];
	}

	if (Array.isArray(value)) {
		return value;
	}

	// @ts-ignore
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
function mergeDeep(
	...objects: Record<string, unknown>[]
): Record<string, unknown> {
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

function hasProperty<O>(object: O, property: string): boolean {
	return Object.prototype.hasOwnProperty.call(object, property);
}

export {
	getParentsFromPath,
	hasProperty,
	mapObjectKeyNames,
	mergeDeep,
	toArray,
};
