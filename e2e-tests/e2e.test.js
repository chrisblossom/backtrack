/* @flow */

import { TempUtils } from '../src/utils/temp-utils';

const backtrack = () => {
    jest.resetModules();

    return require('../src/cli/start').start();
};

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
    process.env.RUN_MODE = 'dev';
    await backtrack();

    /**
     * Updates changed file
     */
    process.env.RUN_MODE = 'init';
    temp.createFile('files/file1.js', '// file1.js updated');

    await backtrack();
    expect(temp.getAllFilesHash()).toMatchSnapshot();

    /**
     * Removes dev and static dir
     */
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
    process.env.RUN_MODE = 'init';

    temp.createFile('backtrack.config.js', 'module.exports = {}');

    await backtrack();

    expect(temp.readFile('package.json')).toEqual({ name: 'test-package' });

    expect(temp.getAllFilesHash()).toMatchSnapshot();
});

test('creates only latest when file already exists and new manged file that is allowed changed', async () => {
    process.env.RUN_MODE = 'init';

    const packageJson = {
        name: 'test-package',
        backtrack: {},
    };

    temp.createFile('package.json', packageJson);

    await backtrack();

    temp.createFile('src/file1.js', '// file1.js not managed');
    expect(temp.getAllFilesHash()).toEqual({
        '.backtrack-stats.json': '6b6c16e551598a31afb4cdb307c906a4',
        'package.json': 'e536df14883ba8f1cecdf12ba4e0b813',
        'src/file1.js': 'bf6054b34f42c85ee3f66a67000651c4',
    });

    /**
     * add file that already exists
     */
    packageJson.backtrack.files = {
        src: 'files/file1.js',
        dest: 'src/file1.js',
        allowChanges: true,
    };
    temp.createFile('package.json', packageJson);
    temp.createFile('files/file1.js', '// file1.js managed');

    await backtrack();

    expect(temp.getAllFilesHash()).toEqual({
        '.backtrack-stats.json': '6e0b335edb90e56e26649d65ad400a06',
        'package.json': '106732492aab6d7ae67334e5d3b7dc2b',
        'files/file1.js': '031895c8d5cd3c29681aa6713950d4c4',
        'src/file1.js': 'bf6054b34f42c85ee3f66a67000651c4',
        'src/file1.js-latest.js': '031895c8d5cd3c29681aa6713950d4c4',
    });
});

test('correctly handles files overridden in preset', async () => {
    process.env.RUN_MODE = 'init';

    temp.createFile('preset1-files/file1.js', '// preset1 file1.js');
    temp.createFile('preset2-files/file1.js', '// preset2 file1.js');

    temp.createFile(
        'preset2.js',
        `'use strict';
const path = require('path');
module.exports = { files: { src: 'preset2-files/file1.js', dest: 'file1.js' } };
`,
    );
    temp.createFile(
        'preset1.js',
        `'use strict';
const path = require('path');
module.exports = { 
  presets: [path.resolve(__dirname, 'preset2.js')],
  files: { src: 'preset1-files/file1.js', dest: 'file1.js' }
};`,
    );

    const packageJson = {
        name: 'test-package',
        backtrack: { presets: ['./preset1.js'] },
    };

    temp.createFile('package.json', packageJson);

    await backtrack();

    const initialFiles = temp.getAllFilesHash();

    expect(initialFiles).toEqual({
        '.backtrack-stats.json': '24d4ddc345ab79a921b5e32a635bce82',
        'package.json': '2d9bb1a99db71a1c36bdb39da7c9124f',
        'file1.js': 'ebec978d6ebcb14a97661268b956be1e',
        'preset1-files/file1.js': 'ebec978d6ebcb14a97661268b956be1e',
        'preset1.js': '3e08db405bd4bf9a14bd49100e847495',
        'preset2-files/file1.js': '31b08120b26d1e362acaea87accfccdb',
        'preset2.js': 'ddf76e8e63dec5848a5e9e963b48495d',
    });

    await backtrack();
    expect(temp.getAllFilesHash()).toEqual(initialFiles);
});
