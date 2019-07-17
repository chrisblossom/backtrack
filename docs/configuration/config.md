# config

`config` is used to modify a configuration set by a package/preset. See also: [config-manager.md](../config-manager.md).

```js
const backtrackConfig = {
	// ...
	config: [
		/**
		 * Automatic config merge
		 *
		 * Performs a deep merge on the two objects.
		 * Will append array items and keep existing object keys.
		 */
		{
			'@backtrack/preset-style' /* config's namespace */: {
				rules: {
					strict: 'off',
				},
			},
		},

		/**
		 * Manual config merge
		 *
		 * Used when automatic merging does not merge as expected
		 */
		{
			'@backtrack/preset-style' /* config's namespace */: (config) => {
				return {
					...config,
					rules: {
						...config.rules,
						strict: 'off',
					},
				};
			},
		},
	],
	// ...
};
```
