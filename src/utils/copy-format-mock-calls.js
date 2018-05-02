/* @flow */

/**
 * copy.mock.calls is async so order is not guaranteed for expected results
 * Converts to plain object
 *
 * For testing purposes only
 *
 * meant to be used as a snapshot with jest-serializer-path
 */

type CopyCalls = [string, string, {}];

function copyFormatMockCalls(calls: $ReadOnlyArray<CopyCalls>) {
    const result = calls.reduce((acc, call) => {
        const src = call[0];
        const dest = call[1];
        const options = call[2];

        return {
            ...acc,
            [src]: {
                dest,
                options,
            },
        };
    }, {});

    return result;
}

export { copyFormatMockCalls };
