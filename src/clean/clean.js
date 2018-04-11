/* @flow */

import del from 'del';
import { makeDirs } from '../utils/make-dirs';

import { buildPath } from '../config/paths';

import type { NormalizedClean } from '../types.js';

const base: NormalizedClean = {
    del: [],
    makeDirs: [],
};

async function clean(args?: NormalizedClean = base): Promise<NormalizedClean> {
    /**
     * Run all del requests together.
     *
     * Ensures you can overwrite presets to exclude files with a glob
     * and all makeDirs are not deleted
     */
    // $FlowIssue
    const delResults = await del(args.del, {
        cwd: buildPath,
        dot: true,
    });

    /**
     * run makeDirs after del has been completed
     */
    await makeDirs(args.makeDirs);

    return {
        del: delResults,
        makeDirs: args.makeDirs,
    };
}

export { clean };
