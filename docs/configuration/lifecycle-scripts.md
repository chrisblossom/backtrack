# Lifecycle Scripts

Lifecycles are comprised of an array of tasks. Tasks can be javascript functions or terminal commands.

All lifecycles are added to `package.json scripts`.

Default / recommended lifecycles are:

```js
[
    // start development environment
    'dev',

    // create production build
    'build',

    // Format project files, e.g. run prettier
    'format',

    // Lint project files, e.g. run eslint
    'lint',

    // Test project, e.g. run jest
    'test',
];
```

It is **highly recommended** to use the default lifecycles above. For example, using `prettier` instead of `format`. This is because there are required internal settings that cannot be handled with unknown lifecycle naming.

To disable a lifecycle set by a preset, set the preset to `false`.

**_NOTE:_** It is not recommended to use a `start` lifecycle because `@backtrack/core` should be in your `devDependencies`, not `dependencies`. Several services will use `start` to initiate your application.

```js
const backtrackConfig = {
    // ...
    dev: [
        /**
         * Tasks run sequentially
         */

        /**
         * Run backtrack lifecycle. Do not use npm run LIFECYCLE
         */
        'backtrack clean',

        /**
         * Run function. Can be a promise or sync function
         */
        () => 'run function1',

        /**
         * Strings are terminal commands
         */
        'eslint . --fix',

        /**
         * Named tasks have the following format
         */
        {
            name: 'lint',
            // Can be any task type
            task: 'eslint .',
        },

        /**
         * Run multiple tasks at the same time
         */
        [() => Promise.resolve('function2'), 'backtrack lint'],
    ],

    /**
     * Disable lifecycle found in other preset
     */
    lint: false,

    /**
     * Disable and replace lifecycle found in preset
     */
    lint: [false, 'eslint .'],
    // ...
};
```

```typescript
type ShellCommand = string;
type CustomFn = Function;

export type NamedTask = {
    name: string;
    task: Task;
};

type Task = Array<ShellCommand | CustomFn | NamedTask>;

type Lifecycles = {
    // default lifecycles
    build?: Task;
    dev?: Task;
    lint?: Task;
    format?: Task;
    test?: Task;

    // custom lifecycles
    [key: string]: Task;
};
```
