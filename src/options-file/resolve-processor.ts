import ResolveWithPrefix from 'resolve-with-prefix';
import path from 'path';
import { toArray } from '../utils/object-utils';

import { Resolve } from '../types';

const resolve = new ResolveWithPrefix();

type Args = {
    value: Resolve | ReadonlyArray<Resolve>;
    current?: Resolve;
    dirname: string;
};

function resolveProcessor(args: Args): Resolve {
    const { value, current = {}, dirname } = args;

    const normalizeValue: Resolve[] = toArray(
        // @ts-ignore
        value,
    );

    const result = normalizeValue.reduce((acc, packageId) => {
        let id;
        let pkgId;

        if (typeof packageId === 'string') {
            id = packageId;
            pkgId = packageId;
        } else if (packageId.packageId) {
            id = packageId.id;
            pkgId = packageId.packageId;
        } else if (packageId.packagePath) {
            id = packageId.id;
            pkgId = path.resolve(dirname, packageId.packagePath);
        } else {
            throw new Error('invalid packageId');
        }

        const resolved = resolve(pkgId, { dirname });

        return {
            ...acc,
            [id]: resolved,
        };
    }, current);

    return result;
}

export { resolveProcessor };
