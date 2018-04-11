# Package Json Manager

`packageJson` is used to manage package.json's settings. If a managed key is modified or deleted, package.json will be backed up and the key replaced.

Adds all lifecycles specified in the config to scripts to use with `npm run` .

For a list of keys that cannot be managed, see [src/presets/package-json-schema.js](../../src/presets/package-json-schema.js).

```js
const backtrackConfig = {
    // ...
    packageJson: [
        {
            // Add precommit to package.json scripts
            scripts: {
                precommit: 'lint-staged',
            },

            // Add lint-staged configuation to package.json
            'lint-staged': {
                '*.{js,jsx,md,css,scss,json}': ['prettier --write', 'git add'],
            },
        },
    ],
    // ...
};
```

```typescript
type PackageJson = Array<{
    [key: string]: any;
}>;
```
