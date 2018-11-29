/* @flow */

require('./group-custom-configs');

const groupCustomConfigs = (namespace, customConfigs) =>
    require('./group-custom-configs').groupCustomConfigs(
        namespace,
        customConfigs,
    );

describe('groupCustomConfigs', () => {
    test('gets matched namespace', () => {
        const customConfigs = [
            {
                'config-1': 1,
            },
            {
                'config-2': 2,
            },
            {
                'config-1': 3,
            },
        ];

        const result = groupCustomConfigs('config-1', customConfigs);

        expect(result).toEqual([1, 3]);
    });

    test('return empty array when none are matched', () => {
        const customConfigs = [
            {
                'config-1': 1,
            },
            {
                'config-2': 2,
            },
            {
                'config-1': 3,
            },
        ];

        const result = groupCustomConfigs('config-3', customConfigs);

        expect(result).toEqual([]);
    });
});
