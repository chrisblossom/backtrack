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
    return copyFiles.reduce(
        (acc, file) => {
            if (file.src && file.dest) {
                return {
                    ...acc,
                    copyFiles: [...acc.copyFiles, file],
                };
            }

            // $FlowIssue
            const { makeDirs = [], ...options } = file;

            return {
                ...acc,
                options: [...acc.options, options],
                makeDirs: [...acc.makeDirs, ...makeDirs],
            };
        },
        { copyFiles: [], options: [], makeDirs: [] },
    );
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

            return acc;
        },
        {
            allowChangesAll: false,
            allowChanges: [],
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
            result.src.files.push(srcId);
            result.src.absolute[srcId] = src.absolute;
            result.src.hash[srcId] = src.hash;

            const destId = dest.relative;
            result.dest.files.push(destId);
            result.dest.absolute[destId] = dest.absolute;
            result.dest.hash[destId] = dest.hash;

            const allowChanges =
                options.allowChanges.includes(destId) || !!file.allowChanges;

            result.dest.allowChanges[destId] =
                options.allowChangesAll || allowChanges;
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
