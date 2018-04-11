/* @flow */

import type { Config } from '../types.js';

function groupCustomConfigs(
    namespace: string,
    customConfigs: $ReadOnlyArray<Config>,
): $ReadOnlyArray<any> {
    const result = customConfigs.reduce((acc, config) => {
        const matched = config[namespace];
        if (matched === undefined) {
            return acc;
        }

        return [...acc, matched];
    }, []);

    return result;
}

export { groupCustomConfigs };
