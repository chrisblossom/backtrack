/**
 * use resolve-with-prefix because it includes patches to the resolve package
 * and as well as it is used by ex-config (consistency)
 */
import ResolveWithPrefix from 'resolve-with-prefix';
import { Resolve } from '../types';

const resolvePkg = new ResolveWithPrefix();

class Pkg {
    resolveMap: Resolve;

    constructor(resolveMap: Resolve = {}) {
        this.resolveMap = resolveMap;

        this.validator = this.validator.bind(this);
        this.resolve = this.resolve.bind(this);
        this.require = this.require.bind(this);
    }

    validator(sourceId: string, packageId: string) {
        if (!sourceId) {
            throw new Error('sourceId is required');
        }

        if (!packageId) {
            throw new Error('packageId is required');
        }

        const dirname = this.resolveMap[sourceId];

        if (!dirname) {
            const sources = Object.keys(this.resolveMap).join(', ');

            throw new Error(
                `sourceId "${sourceId}" is not valid. Available sourceIds: ${sources ||
                    'null'}`,
            );
        }
    }

    resolve(sourceId: string, packageId: string) {
        this.validator(sourceId, packageId);

        const dirname = this.resolveMap[sourceId];

        return resolvePkg(packageId, { dirname });
    }

    require(sourceId: string, packageId: string) {
        this.validator(sourceId, packageId);

        const dirname = this.resolveMap[sourceId];

        const modulePath = resolvePkg(packageId, { dirname });

        return require(modulePath);
    }
}

export { Pkg };
