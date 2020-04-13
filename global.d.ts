declare module 'deep-keys' {
	declare function deepKeys(object: Record<string, unknown>): string[];

	export = deepKeys;
}
