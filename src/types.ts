/* eslint-disable no-use-before-define */

type ShellCommand = string;
type CustomFn = Function;

export type NamedTask = Readonly<{
    name: string;
    task: Task;
}>;

export type AllTaskTypes = ShellCommand | CustomFn | NamedTask;

export type Lifecycle = ReadonlyArray<
    AllTaskTypes | ReadonlyArray<AllTaskTypes>
>;

export type Task = AllTaskTypes | Lifecycle;

export type Copy = {
    dest: string;
    src: string;
    hash?: boolean;
};

export type NormalizedClean = {
    del: Array<string>;
    makeDirs: Array<string>;
    copy: Array<Copy>;
};

export type Clean = {
    del?: string | string[];
    makeDirs?: string | string[];
    copy?: Copy | Copy[];
};

export type CopyFileOptions = {
    makeDirs?: string[] | string;
    skip?: string[] | string;
    allowChanges?: string[] | string | boolean;
    ignoreUpdates?: string[] | string | boolean;
};

export function isCopyFileOptions(obj: any): obj is CopyFileOptions {
    return obj.src === undefined && obj.dest === undefined;
}

export type CopyFile = {
    src: string;
    dest: string;
    allowChanges?: boolean;
    ignoreUpdates?: boolean;
};

export function isCopyFile(obj: any): obj is CopyFile {
    return obj.src !== undefined && obj.dest !== undefined;
}

export type FileManager = Array<CopyFile | CopyFileOptions>;

export type Config = {
    [key: string]: any;
};

type PresetTask =
    | AllTaskTypes
    | false
    | ReadonlyArray<AllTaskTypes | ReadonlyArray<AllTaskTypes> | false>;

export type Files =
    | CopyFile
    | CopyFileOptions
    | false
    | ReadonlyArray<CopyFile | CopyFileOptions | false>;

export type Resolve = { [key: string]: string };

export type Preset = {
    presets?: string | ReadonlyArray<string | [string, {}]>;

    build?: PresetTask;
    dev?: PresetTask;
    lint?: PresetTask;
    format?: PresetTask;
    test?: PresetTask;

    clean?: Clean | false | ReadonlyArray<Clean | false>;
    files?: Files;
    packageJson?: PackageJson | false | ReadonlyArray<PackageJson | false>;
    config?: Config | false | ReadonlyArray<Config | false>;
} & { [key: string]: PresetTask };

export type Lifecycles = {
    build?: Lifecycle;
    dev?: Lifecycle;
    lint?: Lifecycle;
    test?: Lifecycle;
    format?: Lifecycle;

    clean?: NormalizedClean;
    files?: ParsedFiles;
    packageJson?: ReadonlyArray<PackageJson>;
    config?: ReadonlyArray<Config>;
    resolve?: Resolve;
} & { [key: string]: Lifecycle };

export type ParsedFiles = {
    src: {
        files: string[];
        absolute: { [key: string]: string };
        hash: { [key: string]: string };
    };
    dest: {
        files: string[];
        absolute: { [key: string]: string };
        hash: { [key: string]: string };
        allowChanges: { [key: string]: boolean };
        ignoreUpdates: { [key: string]: boolean };
    };
    makeDirs: string[];
};

export type FileStats = Readonly<{ [key: string]: string }>;

export type DirStats = ReadonlyArray<string>;

export type FileManagerStats = Readonly<{
    directories?: DirStats;
    files?: FileStats;
}>;

export type StatsFile = Readonly<{
    fileManager?: FileManagerStats;
    packageJson?: PackageJson;
}>;

export type Scripts = Readonly<{ [key: string]: string | null }>;

export type PackageJson = Readonly<{
    scripts?: Scripts;
}> &
    Readonly<{ [key: string]: unknown }>;

export type CustomError = Readonly<{
    message: string;
    exitCode: number;
}>;
