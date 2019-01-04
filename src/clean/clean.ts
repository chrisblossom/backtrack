import del from 'del';
import { makeDirs } from '../utils/make-dirs';
import { copy } from '../utils/copy';

import { buildPath } from '../config/paths';

import { NormalizedClean } from '../types';

const base: NormalizedClean = {
    del: [],
    makeDirs: [],
    copy: [],
};

async function clean(args: NormalizedClean = base) {
    /**
     * Run all del requests together.
     *
     * Ensures you can overwrite presets to exclude files with a glob
     * and all makeDirs are not deleted
     */
    await del(args.del, {
        cwd: buildPath,
        dot: true,
    });

    /**
     * run makeDirs after del has been completed
     */
    await makeDirs(args.makeDirs);

    /**
     * Copy static files last
     */
    await copy(args.copy);
}

export { clean };
