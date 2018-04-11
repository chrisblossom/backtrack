# Presets

`presets` are used to include shared `backtrack` configurations. Presets are designed to make it easy to separate parts of your application as much as you want. For example, one preset could be for `webpack` and another for `eslint`.

```js
const backtrackConfig = {
    presets: ['@backtrack/preset-style'],
    // ...
};
```

```typescript
/**
 * See actual task documentation for more detailed types
 */

type ShellCommand = string;
type CustomFn = Function;

export type NamedTask = {
    name: string;
    task: Task;
};

type Task = Array<ShellCommand | CustomFn | NamedTask>;

type Clean = Array<{
    del?: string | Array<string>;
    makeDirs?: string | Array<string>;
}>;

type Files = Array<{
    src: string;
    dest: string;
}>;

type PackageJson = Array<{
    [key: string]: any;
}>;

type Config = Array<{
    [key: string]: any;
}>;

type Presets = {
    presets: Array<string>;

    build?: Task;
    dev?: Task;
    lint?: Task;
    format?: Task;
    test?: Task;

    clean: Array<Clean>;
    files: Array<Files>;
    packageJson: Array<PackageJson>;
    config: Array<Config>;

    [key: string]: Task;
};
```
