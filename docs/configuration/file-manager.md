# File Manager

`files` is used to manage files and directories in your project.

By default, `dist` and `src` directories are managed. Use the `skip` option to override.

Use [config](./config.md) to customize configurations in combination with [config-manager](../config-manager.md).

If a managed file is modified or deleted, it will be backed up and replaced with the managed file.

If `allowChanges` is enabled for a file, it is only managed if it is unchanged or removed. If a file has changed and the source file has also changed, the source file will be copied with the `-latest.ext`.

If `ignoreUpdates` is enabled for a file, it is only copied once and the file can be modified. All changes to the source file are ignored. If the file is deleted, the newest version of the file will be copied.

Use the `skip` option to specify an array of files/directories not to be managed. They are equal to the relative directory.

Managed files/directories will be removed when they are no longer managed.

```js
const backtrackPaths = require('@backtrack/core/paths');

const backtrackConfig = {
    // ...
    files: [
        {
            /**
             * Source file
             *
             * relative to configuration file
             */
            src: 'files/.eslintrc.js',

            /**
             * Destination file
             *
             * relative to project directory
             */
            dest: '.eslintrc.js',

            /**
             * Allow file to be modified
             * Highly recommended to use the config manager instead
             *
             * optional
             * default: false
             */
            allowChanges: false,

            /**
             * Allow file to be modified and do not copy
             * source file changes to -latest
             *
             * optional
             * default: false
             */
            ignoreUpdates: false,
        },

        /**
         * Options
         */
        {
            /**
             * Create directories
             *
             * dist and src are created by default
             */
            makeDirs: ['static'],

            /**
             * Do not copy/manage .eslintrc.js, build or source paths
             */
            skip: [
                '.eslintrc.js',
                backtrackPaths.sourcePath,
                backtrackPaths.buildPath,
            ],

            /**
             * Allow changes with .eslintrc.js
             *
             * After modified, updated source files will
             * have the name .eslintrc.js-latest.js
             *
             * If the file is deleted it will be recreated
             * with the latest source file.
             */
            allowChanges: ['.eslintrc.js'],

            /**
             * Allow changes and completely ignore
             * source file updates to .prettierrc.js
             *
             * If the file is deleted it will be recreated
             * with the latest source file.
             */
            ignoreUpdates: ['.prettierrc.js'],
        },

        {
            /**
             * Allow changes with all files
             *
             * default: false
             */
            allowChanges: true,
        },

        {
            /**
             * Ignore source file updates to all files
             *
             * default: false
             */
            ignoreUpdates: true,
        },
    ],
    // ...
};
```

## options:

#### Copy Files

`src`: source file relative to configuration file

`dest`: destination file relative to project root

`allowChanges`: when set to `true`, managed file can be modified, and latest revisions will be copied alongside the file with `-latest` filename tag

`ignoreUpdates`: when set to `true`, managed file can be modified and all source file updates are ignored.

#### Options Object

`allowChanges`: [list of files that can be modified], when set to `true`, all managed files are able to be modified

`ignoreUpdates`: [list of files that updates are ignored], when set to `true`, all managed file updates are ignored

`skip`: [list of files/directories to disable management]

`makeDirs`: [list of directories to create]

####
