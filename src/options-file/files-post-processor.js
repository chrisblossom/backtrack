/* @flow */

import path from 'path';
import { parseFilePath } from '../utils/parse-file-path';
import { normalizePathname } from '../utils/normalize-pathname';
import { toArray } from '../utils/object-utils';

import type { FileManager, ParsedFiles } from '../types.js';

function shouldSkip(pathname, skipFiles) {
    const split = pathname.split(path.sep);

    let currentPath;
    for (const sub of split) {
        currentPath = currentPath ? currentPath + path.sep + sub : sub;

        if (skipFiles.includes(currentPath)) {
            return true;
        }
    }

    return false;
}

function splitSections(copyFiles) {
    const sections = copyFiles.reduceRight(
        (acc, file) => {
            if (file.src && file.dest) {
                const isDuplicate = acc.copyFiles.some((accFile) => {
                    return file.dest === accFile.dest;
                });

                /**
                 * Remove duplicates
                 */
                if (isDuplicate) {
                    return acc;
                }

                return {
                    ...acc,
                    copyFiles: [file, ...acc.copyFiles],
                };
            }

            // $FlowIssue
            const { makeDirs = [], ...options } = file;

            return {
                ...acc,
                options: [options, ...acc.options],
                makeDirs: [...makeDirs, ...acc.makeDirs],
            };
        },
        { copyFiles: [], options: [], makeDirs: [] },
    );

    return sections;
}

function parseOptions(options) {
    return options.reduce(
        (acc, fileOptions) => {
            if (fileOptions.skip) {
                toArray(fileOptions.skip).forEach((relativePath) => {
                    const normalizedFile = normalizePathname(relativePath);

                    acc.skip.push(normalizedFile);
                });
            }

            if (typeof fileOptions.allowChanges === 'boolean') {
                acc.allowChangesAll = fileOptions.allowChanges;

                return acc;
            }

            toArray(fileOptions.allowChanges).forEach((file) => {
                const normalizedFile = normalizePathname(file);

                acc.allowChanges.push(normalizedFile);
            });

            if (typeof fileOptions.ignoreUpdates === 'boolean') {
                acc.ignoreUpdatesAll = fileOptions.ignoreUpdates;

                return acc;
            }

            toArray(fileOptions.ignoreUpdates).forEach((file) => {
                const normalizedFile = normalizePathname(file);

                acc.ignoreUpdates.push(normalizedFile);
            });

            return acc;
        },
        {
            allowChangesAll: false,
            ignoreUpdatesAll: false,
            allowChanges: [],
            ignoreUpdates: [],
            skip: [],
        },
    );
}

function getMakeDirs(makeDirs, files, skipFiles) {
    const filePaths = files
        .map((filePath) => {
            const { dir } = path.parse(filePath);

            return dir;
        })
        .filter(Boolean);

    const result = [...filePaths, ...makeDirs]
        // eslint-disable-next-line arrow-body-style
        .map((dir) => normalizePathname(dir))
        .sort()
        .reduceRight((acc, dir) => {
            /**
             * remove skipped
             */
            const skip = shouldSkip(dir, skipFiles);

            if (skip === true) {
                return acc;
            }

            /**
             * removes redundant directories
             * ['src', 'dist', 'dist/static'] -> ['src', 'dist/static']
             */
            const previous = acc[0];
            if (previous) {
                const trimmedPrevious = previous.substring(0, dir.length);

                if (trimmedPrevious === dir) {
                    return acc;
                }
            }

            return [dir, ...acc];
        }, []);

    return result;
}

// eslint-disable-next-line flowtype/require-exact-type
type Args = {
    value: FileManager,
};

/**
 * Normally this would be a normal processor, but we need to have all results up front
 * to determine what to exclude etc. I'm sure the function could be rewritten but this works as is.
 */
function filesPostProcessor({ value = [] }: Args = {}): ParsedFiles {
    const result = {
        src: {
            files: [],
            absolute: {},
            hash: {},
        },
        dest: {
            files: [],
            absolute: {},
            hash: {},
            allowChanges: {},
            ignoreUpdates: {},
        },
        makeDirs: [],
    };

    const sections = splitSections(value);
    const options = parseOptions(sections.options);

    for (const file of sections.copyFiles) {
        const src = parseFilePath(file.src);
        const dest = parseFilePath(file.dest);

        const skip = shouldSkip(dest.relative, options.skip);
        if (skip === false) {
            const srcId = src.relative;
            const destId = dest.relative;

            const ignoreUpdates =
                options.ignoreUpdatesAll ||
                options.ignoreUpdates.includes(destId) ||
                !!file.ignoreUpdates;

            result.src.files.push(srcId);
            result.src.absolute[srcId] = src.absolute;
            result.src.hash[srcId] =
                ignoreUpdates === false ? src.hash : 'ignoreUpdates';

            result.dest.files.push(destId);
            result.dest.absolute[destId] = dest.absolute;
            result.dest.hash[destId] = dest.hash;

            const allowChanges =
                ignoreUpdates ||
                options.allowChanges.includes(destId) ||
                !!file.allowChanges;

            result.dest.ignoreUpdates[destId] = ignoreUpdates;

            result.dest.allowChanges[destId] =
                options.ignoreUpdatesAll ||
                options.allowChangesAll ||
                allowChanges;
        }
    }

    result.makeDirs = getMakeDirs(
        sections.makeDirs,
        result.dest.files,
        options.skip,
    );

    return result;
}

export { filesPostProcessor };
