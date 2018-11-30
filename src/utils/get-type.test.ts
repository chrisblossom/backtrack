import { getType } from './get-type';

describe('getType', () => {
    test('gets type', () => {
        expect(getType([])).toEqual('array');
        expect(getType(true)).toEqual('boolean');
        expect(getType(new Date())).toEqual('date');
        expect(getType(() => '')).toEqual('function');
        expect(getType(1)).toEqual('number');
        expect(getType({})).toEqual('plain object');
        expect(getType('')).toEqual('string');
        expect(getType(null)).toEqual('null');
        expect(getType(undefined)).toEqual('undefined');
        expect(getType()).toEqual('undefined');
        expect(getType(Promise.resolve())).toEqual('promise');
        expect(getType(NaN)).toEqual('NaN');
        expect(getType(/fred/)).toEqual('regex');
    });
});
