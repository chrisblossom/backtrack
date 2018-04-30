/* @flow */

import path from 'path';
import os from 'os';
import del from 'del';
import {
    readFileSync,
    realpathSync,
    writeFileSync,
} from 'fs';
import { createHash } from 'crypto';
import fse from 'fs-extra';
import parentModule from 'parent-module';
import readPkgUp from 'read-pkg-up';
import { readDirDeepSync } from './read-dir-deep';

class TempUtils {
    dir: string;

    constructor() {
        const tempDir = realpathSync(os.tmpdir());
        const parent = parentModule();
        const relativeParent = path.relative(process.cwd(), parent);

        /**
         * create base directory based on package name
         */
        const baseDir = readPkgUp
            .sync({
                cwd: parent,
                normalize: false,
            })
            .pkg.name // replace special characters for directory name
            .replace(/[^a-zA-Z0-9]/g, '-');

        /**
         * Each temp directory will be unique to the file
         */
        this.dir = path.resolve(tempDir, baseDir, `${relativeParent}-dir`);

        // create directory
        fse.ensureDirSync(this.dir);

        (this: any).absolutePath = this.absolutePath.bind(this);
        (this: any).createDir = this.createDir.bind(this);
        (this: any).createFile = this.createFile.bind(this);
        (this: any).deleteFile = this.deleteFile.bind(this);
        (this: any).readFile = this.readFile.bind(this);
        (this: any).getAllFiles = this.getAllFiles.bind(this);
        (this: any).getFileHash = this.getFileHash.bind(this);
        (this: any).getAllFilesHash = this.getAllFilesHash.bind(this);
        (this: any).clean = this.clean.bind(this);
        (this: any).deleteTempDir = this.deleteTempDir.bind(this);
    }

    absolutePath(dir: string) {
        return path.join(this.dir, dir);
    }

    createDir(dir: string) {
        const dirname = this.absolutePath(dir);
        fse.ensureDirSync(dirname);
    }

    createFile(file: string, contents: string | Object) {
        const filePath = this.absolutePath(file);
        const fileDir = path.parse(filePath).dir;
        fse.ensureDirSync(fileDir);

        if (typeof contents === 'object') {
            // eslint-disable-next-line no-param-reassign
            contents = JSON.stringify(contents);
        }

        // all files append new line
        if (typeof contents === 'string' && contents.slice(-1) !== '\n') {
            // eslint-disable-next-line no-param-reassign
            contents += '\n';
        }

        writeFileSync(filePath, `${contents}`);
    }

    deleteFile(file: string) {
        const filePath = this.absolutePath(file);

        const removed = del.sync(filePath, { root: this.dir });

        return removed;
    }

    readFile(file: string) {
        const filePath = this.absolutePath(file);

        let result = readFileSync(filePath, 'utf8');
        try {
            result = JSON.parse(result);
            // eslint-disable-next-line no-empty
        } catch (e) {}

        return result;
    }

    getFileHash(file: string) {
        const filePath = this.absolutePath(file);

        const fileBody = readFileSync(filePath);
        const hash = createHash('md5')
            .update(fileBody)
            .digest('hex');

        return hash;
    }

    getAllFiles() {
        const fileList = readDirDeepSync(this.dir);

        return fileList;
    }

    getAllFilesHash() {
        const fileList = this.getAllFiles();
        const result = fileList.reduce((acc, file) => {
            const fileHash = this.getFileHash(file);
            return {
                ...acc,
                [file]: fileHash,
            };
        }, {});

        return result;
    }

    clean() {
        const cleanPattern = this.absolutePath('**/*');
        del.sync(cleanPattern, {
            root: this.dir,
            dot: true,
        });
    }

    deleteTempDir() {
        del.sync(this.dir, { force: true, dot: true });
    }
}

export { TempUtils };
