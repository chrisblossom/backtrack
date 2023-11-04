/* eslint-disable no-use-before-define */
type ShellCommand = string;
// eslint-disable-next-line @typescript-eslint/ban-types
type CustomFn = Function;

export type NamedTask = Readonly<{
	name: string;
	task: Task;
}>;

export type AllTaskTypes = ShellCommand | CustomFn | NamedTask;

export type Lifecycle = readonly (AllTaskTypes | readonly AllTaskTypes[])[];

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

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export function isCopyFileOptions(value: any): value is CopyFileOptions {
	// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
	return value.src === undefined && value.dest === undefined;
}

export interface CopyFile {
	src: string;
	dest: string;
	allowChanges?: boolean;
	ignoreUpdates?: boolean;
}

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export function isCopyFile(obj: any): obj is CopyFile {
	// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
	return obj.src !== undefined && obj.dest !== undefined;
}

export type FileManager = (CopyFile | CopyFileOptions)[];

export interface Config {
	[key: string]: any;
}

type PresetTask =
	| AllTaskTypes
	| false
	| readonly (AllTaskTypes | readonly AllTaskTypes[] | false)[];

export type Files =
	| CopyFile
	| CopyFileOptions
	| false
	| readonly (CopyFile | CopyFileOptions | false)[];

export interface Resolve {
	[key: string]: string;
}

export type Preset = {
	presets?: string | readonly (string | [string, Record<string, unknown>])[];

	build?: PresetTask;
	dev?: PresetTask;
	lint?: PresetTask;
	format?: PresetTask;
	test?: PresetTask;

	clean?: Clean | false | readonly (Clean | false)[];
	files?: Files;
	packageJson?: PackageJson | false | readonly (PackageJson | false)[];
	config?: Config | false | readonly (Config | false)[];
} & { [key: string]: PresetTask };

export type Lifecycles = {
	build?: Lifecycle;
	dev?: Lifecycle;
	lint?: Lifecycle;
	test?: Lifecycle;
	format?: Lifecycle;

	clean?: NormalizedClean;
	files?: ParsedFiles;
	packageJson?: readonly PackageJson[];
	config?: readonly Config[];
	resolve?: Resolve;
} & { [key: string]: Lifecycle };

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

export type FileStats = Readonly<{ [key: string]: string }>;

export type DirStats = readonly string[];

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
