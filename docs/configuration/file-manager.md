# File Manager

`files` is used to manage files and directories in your project.

By default, `dist` and `src` directories are managed. Use the `skip` option to override.

Use [config](./config.md) to customize configurations in combination with [config-manager](../config-manager.md).

If a managed file is modified or deleted, it will be backed up and replaced with the managed file.

If `allowChanges` is enabled for a file, it is only managed if it is unchanged or removed. If a file has changed and the source file has also changed, the source file will be copied with the `-latest.ext`.

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
        },

        /**
         * Create directories
         *
         * dist and src are created by default
         */
        {
            makeDirs: ['static'],
        },

        /**
         * Options
         */
        {
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
             * This file can be deleted, but will be recreated
             * if the source file is changed again.
             */
            allowChanges: ['.eslintrc.js'],
        },

        {
            /**
             * Allow changes with all files
             *
             * default: false
             */
            allowChanges: false,
        },
    ],
    // ...
};
```

## options:

#### Copy Files

`allowChanges`: when set to `true`, managed file can be modified

#### Create Directories

`makeDirs`: [list of directories to create]

#### Options Object

`allowChanges`: [list of files that can be modified], when set to `true`, all managed files are able to be modified

`skip`: [list of files/directories to disable management]
