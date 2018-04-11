# clean lifecycle

`clean` is used to remove files and create directories inside the dist folder.

**All paths are relative to the dist folder.**

```js
const backtrackConfig = {
    // ...
    clean: [
        {
            // delete everything in 'dist/**/*' except .gitignore
            del: ['**/*', '!.gitignore'],
            makeDirs: [
                // create directory 'dist/static/favicons/'
                'static/favicons',
            ],
        },
    ],
    // ...
};
```

```typescript
type Clean = Array<{
    del?: string | Array<string>;
    makeDirs?: string | Array<string>;
}>;
```

## options:

##### del: [patterns]

See [isaacs/minimatch#usage](https://github.com/isaacs/minimatch#usage) for glob patterns.

##### makeDirs: [directories]
