import path from 'path';
import fs from 'fs';
import fse from 'fs-extra';
import readDirDeep from 'read-dir-deep';
import { getFileHash } from './get-file-hash';
import { toArray } from './object-utils';

function stat(pathname: string) {
    return new Promise((resolve, reject) => {
        fs.stat(pathname, (error, stats) => {
            if (error) {
                reject(error);

                return;
            }

            resolve(stats);
        });
    });
}

export type File = Readonly<{
    src: string;
    dest: string;

    hash?: boolean;

    /**
     * fs-extra copy options
     * https://github.com/jprichardson/node-fs-extra/blob/master/docs/copy.md#copysrc-dest-options-callback
     */
    overwrite?: boolean;
    errorOnExist?: boolean;
    preserveTimestamps?: boolean;
}>;

function getHashedName(source: string, dest: string) {
    const parsed = path.parse(dest);
    const fileHash = getFileHash(source).substring(0, 8);

    const rename = `${parsed.name}.${fileHash}${parsed.ext}`;

    const result = path.join(parsed.dir, rename);

    return result;
}

/**
 * See https://github.com/jprichardson/node-fs-extra/blob/master/docs/copy.md#copysrc-dest-options-callback
 * for options
 */
function copy(files: ReadonlyArray<File> | File): Promise<void> {
    const normalized = toArray(files);

    const copyFilesResult = normalized.map(async (file) => {
        const {
            src,
            hash = false,

            overwrite = true,
            errorOnExist = true,
            preserveTimestamps = true,
        } = file;

        const fseCopyOptions = {
            overwrite,
            errorOnExist,
            preserveTimestamps,
        };

        let dest = file.dest;

        // @ts-ignore
        const isDirectory: Boolean = (await stat(src)).isDirectory();
        if (isDirectory) {
            const deepFileList: string[] = await readDirDeep(src);

            type CopyFilesToDestAcc = {
                src: string;
                dest: string;
                overwrite: boolean;
                errorOnExist: boolean;
                preserveTimestamps: boolean;
            };

            const copyFilesToDest = deepFileList.reduce(
                (acc: CopyFilesToDestAcc[], sourceFile) => {
                    const absoluteSourcePath = path.resolve(src, sourceFile);

                    let absoluteDestinationPath = path.resolve(
                        dest,
                        sourceFile,
                    );

                    if (hash === true) {
                        absoluteDestinationPath = getHashedName(
                            absoluteSourcePath,
                            absoluteDestinationPath,
                        );
                    }

                    return [
                        ...acc,
                        {
                            src: absoluteSourcePath,
                            dest: absoluteDestinationPath,
                            ...fseCopyOptions,
                        },
                    ];
                },
                [],
            );

            /**
             * copy all directory files
             */
            return copy(copyFilesToDest);
        }

        if (hash === true) {
            dest = getHashedName(src, file.dest);
        }

        return fse.copy(src, dest, fseCopyOptions);
    });

    return Promise.all(copyFilesResult).then(() => {
        /**
         * fse.copy does not return any values. explicitly return undefined for promise.all
         */
        return undefined;
    });
}

export { copy };
