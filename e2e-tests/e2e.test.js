/* @flow */

import { TempUtils } from '../src/utils/temp-utils';

const backtrack = () => require('../src/cli/start').start();

const temp = new TempUtils();
const cwd = process.cwd();
const runMode = process.env.RUN_MODE;
const handleErrorMock = jest.fn();
let processExitSpy;

beforeEach(() => {
    process.chdir(temp.dir);
    temp.clean();

    // Suppress all console logging
    jest.spyOn(console, 'info').mockImplementation(() => undefined);
    jest.spyOn(console, 'warn').mockImplementation(() => undefined);
    jest.spyOn(console, 'error').mockImplementation(() => undefined);
    jest.spyOn(console, 'debug').mockImplementation(() => undefined);

    processExitSpy = jest
        .spyOn(process, 'exit')
        .mockImplementation(() => undefined);
    jest.doMock('../src/utils/handle-error.js', () => ({
        handleError: (...args) => {
            handleErrorMock(...args);

            // $FlowIgnore
            const handleError = require.requireActual(
                '../src/utils/handle-error.js',
            ).handleError;

            return handleError(...args);
        },
    }));
});

afterEach(() => {
    process.chdir(cwd);
    process.env.RUN_MODE = runMode;
    jest.restoreAllMocks();
});

afterAll(() => {
    temp.deleteTempDir();
});

function getError() {
    const result = handleErrorMock.mock.calls[0][0];

    if (!result.error) {
        return result;
    }

    if (result.error.message) {
        result.message = result.error.message;
    }

    if (result.error.code) {
        result.code = result.error.code;
    }

    delete result.error;

    return result;
}

test('exits when no config found', async () => {
    process.env.RUN_MODE = 'init';

    await backtrack();

    expect(processExitSpy).toHaveBeenCalledWith(1);

    const error = getError();
    expect(error.message).toEqual('backtrack config not found');
});

test('backtrack', async () => {
    process.env.RUN_MODE = 'init';

    temp.createFile('package.json', { name: 'test-package' });
    temp.createFile('files/file1.js', '// file1.js');
    temp.createFile('static/static-file.js', '// static-file.js');
    temp.createFile('static-1/static1-file.js', '// static1-file.js');

    const config = {
        clean: {
            del: '**/*',
            copy: [
                {
                    src: 'static',
                    dest: 'static',
                },
                {
                    src: 'static-1/static1-file.js',
                    dest: 'static/static1-file.js',
                },
            ],
        },
        files: {
            src: 'files/file1.js',
            dest: 'file1.js',
        },
        packageJson: {
            scripts: {
                test: 'jest',
            },
        },
        dev: ['echo'],
    };

    temp.createFile(
        'backtrack.config.js',
        `module.exports = ${JSON.stringify(config)}`,
    );

    /**
     * Initial
     */
    await backtrack();

    expect(temp.readFile('package.json')).toEqual({
        name: 'test-package',
        scripts: {
            dev: 'backtrack dev --development',
            clean: 'backtrack clean',
            test: 'jest',
        },
    });

    const initialFileHash = temp.getAllFilesHash();
    expect(initialFileHash).toMatchSnapshot();

    expect(processExitSpy).toHaveBeenCalledTimes(0);
    expect(handleErrorMock).toHaveBeenCalledTimes(0);

    /**
     * Ensure no changes after initialization
     */
    await backtrack();
    expect(temp.getAllFilesHash()).toEqual(initialFileHash);

    /**
     * runs dev script
     */
    jest.resetModules();
    process.env.RUN_MODE = 'dev';
    await backtrack();

    /**
     * Updates changed file
     */
    jest.resetModules();
    process.env.RUN_MODE = 'init';
    temp.createFile('files/file1.js', '// file1.js updated');

    await backtrack();
    expect(temp.getAllFilesHash()).toMatchSnapshot();

    /**
     * Removes dev and static dir
     */
    jest.resetModules();
    process.env.RUN_MODE = 'init';

    delete config.dev;
    delete config.clean.copy;

    temp.createFile(
        'backtrack.config.js',
        `module.exports = ${JSON.stringify(config)}`,
    );

    await backtrack();

    expect(temp.readFile('package.json')).toEqual({
        name: 'test-package',
        scripts: {
            clean: 'backtrack clean',
            test: 'jest',
        },
    });

    expect(temp.getAllFilesHash()).toMatchSnapshot();

    /**
     * Removes everything
     */
    jest.resetModules();
    process.env.RUN_MODE = 'init';

    temp.createFile('backtrack.config.js', 'module.exports = {}');

    await backtrack();

    expect(temp.readFile('package.json')).toEqual({ name: 'test-package' });

    expect(temp.getAllFilesHash()).toMatchSnapshot();
});
