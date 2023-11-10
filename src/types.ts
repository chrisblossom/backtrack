/* eslint-disable no-use-before-define */

type ShellCommand = string;
// eslint-disable-next-line @typescript-eslint/ban-types
type CustomFn = Function;

export interface NamedTask {
	name: string;
	task: Task;
}

export type AllTaskTypes = ShellCommand | CustomFn | NamedTask;

export type Lifecycle = (AllTaskTypes | AllTaskTypes[])[];

export type Task = AllTaskTypes | Lifecycle;

export interface Copy {
	dest: string;
	src: string;
	hash?: boolean;
}

export interface NormalizedClean {
	del: string[];
	makeDirs: string[];
	copy: Copy[];
}

export interface Clean {
	del?: string | string[];
	makeDirs?: string | string[];
	copy?: Copy | Copy[];
}

export interface CopyFileOptions {
	makeDirs?: string[] | string;
	skip?: string[] | string;
	allowChanges?: string[] | string | boolean;
	ignoreUpdates?: string[] | string | boolean;
}

export interface CopyFile {
	src: string;
	dest: string;
	allowChanges?: boolean;
	ignoreUpdates?: boolean;
}

/* eslint-disable @typescript-eslint/explicit-module-boundary-types,@typescript-eslint/no-unsafe-member-access */
export function isCopyFileOptions(value: any): value is CopyFileOptions {
	return value.src === undefined && value.dest === undefined;
}

export function isCopyFile(obj: any): obj is CopyFile {
	return obj.src !== undefined && obj.dest !== undefined;
}

/* eslint-enable @typescript-eslint/explicit-module-boundary-types,@typescript-eslint/no-unsafe-member-access */

export type FileManager = (CopyFile | CopyFileOptions)[];

type PresetTask =
	| AllTaskTypes
	| false
	| (AllTaskTypes | AllTaskTypes[] | false)[];

export type Files =
	| CopyFile
	| CopyFileOptions
	| false
	| (false | CopyFile | CopyFileOptions)[];

export interface Resolve {
	[key: string]: string;
}

export type ExternalConfig = Record<string, unknown[]>;

// Backtrack Config Files
export type BacktrackConfig = {
	presets?: string | (string | [string, Record<string, unknown>])[];

	build?: PresetTask;
	dev?: PresetTask;
	lint?: PresetTask;
	format?: PresetTask;
	test?: PresetTask;

	clean?: (Clean | false) | (false | Clean)[];
	files?: Files;
	packageJson?: (PackageJson | false) | (false | PackageJson)[];
	config?:
		| (Record<string, unknown> | false)
		| (false | Record<string, unknown>)[];
} & Record<string, PresetTask>;

export type Lifecycles = {
	build?: Lifecycle;
	dev?: Lifecycle;
	lint?: Lifecycle;
	test?: Lifecycle;
	format?: Lifecycle;

	clean?: NormalizedClean;
	files?: ParsedFiles;
	packageJson?: PackageJson[];
	config?: ExternalConfig;
	resolve?: Resolve;
} & Record<string, Lifecycle>;

export interface ParsedFiles {
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
}

export type FileStats = Record<string, string>;

export type DirStats = string[];

export interface FileManagerStats {
	directories?: DirStats;
	files?: FileStats;
}

// eslint-disable-next-line @typescript-eslint/consistent-type-definitions -- neded for sortKeys type
export type StatsFile = {
	fileManager?: FileManagerStats;
	packageJson?: PackageJson;
};

export type Scripts = Record<string, string | null>;
// prettier-ignore
export type PackageJson =
	{ scripts?: Scripts } &
	Record<string, unknown>;
