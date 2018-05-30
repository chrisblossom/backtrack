/* @flow */

/* eslint-disable no-use-before-define */

type ShellCommand = string;
type CustomFn = Function;

export type NamedTask = {|
    name: string,
    task: Task,
|};

export type AllTaskTypes = ShellCommand | CustomFn | NamedTask;

export type Lifecycle = $ReadOnlyArray<
    AllTaskTypes | $ReadOnlyArray<AllTaskTypes>,
>;

export type Task = AllTaskTypes | Lifecycle;

export type Copy = {|
    dest: string,
    src: string,
    hash?: boolean,
|};

export type NormalizedClean = {|
    del: $ReadOnlyArray<string>,
    makeDirs: $ReadOnlyArray<string>,
    copy: $ReadOnlyArray<Copy>,
|};

export type Clean = {|
    del?: string | $ReadOnlyArray<string>,
    makeDirs?: string | $ReadOnlyArray<string>,
    copy?: Copy | $ReadOnlyArray<Copy>,
|};

type CopyFileOptions = {|
    +makeDirs?: $ReadOnlyArray<string> | string,
    +skip?: $ReadOnlyArray<string> | string,
    +allowChanges?: $ReadOnlyArray<string> | string | boolean,
    +ignoreUpdates?: $ReadOnlyArray<string> | string | boolean,
|};

export type CopyFile = {|
    +src: string,
    +dest: string,
    +allowChanges?: boolean,
    +ignoreUpdates?: boolean,
|};

export type FileManager = $ReadOnlyArray<CopyFile | CopyFileOptions>;

// eslint-disable-next-line flowtype/require-exact-type
export type Config = {
    [key: string]: any,
};

type PresetTask =
    | AllTaskTypes
    | false
    | $ReadOnlyArray<AllTaskTypes | $ReadOnlyArray<AllTaskTypes> | false>;

export type Files =
    | CopyFile
    | CopyFileOptions
    | false
    | $ReadOnlyArray<CopyFile | CopyFileOptions | false>;

// eslint-disable-next-line flowtype/require-exact-type
export type Resolve = { [key: string]: string };

// eslint-disable-next-line flowtype/require-exact-type
export type Preset = {
    presets?: string | $ReadOnlyArray<string | [string, ?{}]>,

    build?: PresetTask,
    dev?: PresetTask,
    lint?: PresetTask,
    format?: PresetTask,
    test?: PresetTask,

    clean?: Clean | false | $ReadOnlyArray<Clean | false>,
    files?: Files,
    packageJson?: PackageJson | false | $ReadOnlyArray<PackageJson | false>,
    config?: Config | false | $ReadOnlyArray<Config | false>,

    [key: string]: PresetTask,
};

// eslint-disable-next-line flowtype/require-exact-type
export type Lifecycles = {
    build?: Lifecycle,
    dev?: Lifecycle,
    lint?: Lifecycle,
    test?: Lifecycle,
    format?: Lifecycle,

    clean?: NormalizedClean,
    files?: ParsedFiles,
    packageJson?: $ReadOnlyArray<PackageJson>,
    config?: $ReadOnlyArray<Config>,
    resolve?: Resolve,

    [key: string]: Lifecycle,
};

export type ParsedFiles = {|
    src: {|
        files: $ReadOnlyArray<string>,
        absolute: { [key: string]: string },
        hash: { [key: string]: string },
    |},
    dest: {|
        files: $ReadOnlyArray<string>,
        absolute: { [key: string]: string },
        hash: { [key: string]: string },
        allowChanges: { [key: string]: boolean },
        ignoreUpdates: { [key: string]: boolean },
    |},
    makeDirs: $ReadOnlyArray<string>,
|};

export type FileStats = $ReadOnly<{ [key: string]: string }>;

export type DirStats = $ReadOnlyArray<string>;

export type FileManagerStats = $ReadOnly<{
    directories?: DirStats,
    files?: FileStats,
    [any]: empty,
}>;

export type StatsFile = $ReadOnly<{
    fileManager?: FileManagerStats,
    packageJson?: PackageJson,
    // https://github.com/facebook/flow/issues/4582
    // https://github.com/facebook/flow/issues/2386
    [any]: empty,
}>;

export type Scripts = $ReadOnly<{ [key: string]: string | null }>;

export type PackageJson = $ReadOnly<{
    scripts?: Scripts,
}>;

export type CustomError = {|
    +message: string,
    +exitCode: number,
|};
