/* @flow */

import path from 'path';
import { TempUtils } from '../src/utils/temp-utils';

require('../src/cli/start');

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

test('creates only latest when file already exists and new managed file that is allowed changed', async () => {
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

test('correctly handles multiple shell commands', async () => {
    temp.createFile('file1.js', `console.log('file1.js');`);
    temp.createFile('file2.js', `console.log('file2.js');`);

    /**
     * Get del-cli path
     */
    const delPath = require.resolve('del');
    const delDirname = path.parse(delPath).dir;
    const nodeModules = delDirname.split(path.sep);
    nodeModules.pop();
    const nodeModulesDirname = nodeModules.join(path.sep);
    const delCli = path.resolve(nodeModulesDirname, '.bin/del-cli');

    const packageJson = {
        name: 'test-package',
        backtrack: {
            packageJson: {
                scripts: {
                    'del-file1': `${delCli} ./file1.js`,
                    'del-file2': `${delCli} ./file2.js`,
                },
            },
            'run-cmd': 'npm run del-file1 && npm run del-file2',
        },
    };

    temp.createFile('package.json', packageJson);

    process.env.RUN_MODE = 'init';
    await backtrack();

    const initialFiles = temp.getAllFilesHash();
    // $FlowIgnore
    delete initialFiles['.backtrack-stats.json'];
    // $FlowIgnore
    delete initialFiles['package.json'];

    expect(initialFiles).toEqual({
        'file1.js': 'ddfc5faf00a6852daf7c5ea10163d138',
        'file2.js': '5629bb53733e6f8c3af391f2cd47a8bd',
    });

    process.env.RUN_MODE = 'run-cmd';
    await backtrack();

    const filesRemoved = temp.getAllFilesHash();
    // $FlowIgnore
    delete filesRemoved['.backtrack-stats.json'];
    // $FlowIgnore
    delete filesRemoved['package.json'];

    expect(filesRemoved).toEqual({});
});

test('correctly handles removing array values from managed package.json key', async () => {
    process.env.RUN_MODE = 'init';

    temp.createFile('package.json', {
        name: 'test-package',
    });

    temp.createFile(
        'backtrack.config.js',
        `module.exports = ${JSON.stringify({
            packageJson: {
                files: ['one/', 'two/'],
            },
        })}`,
    );

    await backtrack();
    const initialFiles = temp.getAllFilesHash();

    expect(initialFiles).toEqual({
        '.backtrack-stats.json': '6195c19fcd4629ea7fffb8bf1bd3a951',
        'backtrack.config.js': '6251fb7493b440a1530b031384c67632',
        'package.json': 'a6371c71981bcab5aeaa575e39e4994b',
    });

    temp.createFile(
        'backtrack.config.js',
        `module.exports = ${JSON.stringify({
            packageJson: {
                files: ['one/'],
            },
        })}`,
    );

    await backtrack();
    // run twice, was previously adding backup file second run
    await backtrack();

    expect(temp.getAllFilesHash()).toEqual({
        '.backtrack-stats.json': 'c40a50d3f34d257cbc0b124c3b53f543',
        'backtrack.config.js': 'ea70dd8597e9bd71cbf6901cb8a2e176',
        'package.json': '978b66e46622f48835a3d38dcb2f88a7',
    });
});

test('completely ignores updates to ignored source files', async () => {
    process.env.RUN_MODE = 'init';

    temp.createFile('package.json', {
        name: 'test-package',
    });

    temp.createFile('files/file1.js', '// file1.js');

    temp.createFile(
        'backtrack.config.js',
        `module.exports = ${JSON.stringify({
            files: {
                src: 'files/file1.js',
                dest: 'file1.js',
                ignoreUpdates: true,
            },
        })}`,
    );

    await backtrack();
    const initialFiles = temp.getAllFilesHash();

    expect(initialFiles).toEqual({
        '.backtrack-stats.json': 'b5302f926313cf6d6c7f269a2ddc0bbc',
        'backtrack.config.js': 'c940bddf3d3e702288435d3d5e4e6918',
        'file1.js': '7f477fcd51e87d9e65b134b17771dc03',
        'files/file1.js': '7f477fcd51e87d9e65b134b17771dc03',
        'package.json': '624e8f9f0a4bb033c9998d9ecf24b393',
    });

    temp.createFile('files/file1.js', '// file1.js nested modified');
    temp.createFile('file1.js', '// file1.js modified');

    await backtrack();

    // eslint-disable-next-line no-console
    const loggedUpdateMessage = console.info.mock.calls.some((message) => {
        return message[1].includes(
            'Unmanaged file file1.js source changed. Updating .backtrack-stats.json',
        );
    });
    expect(loggedUpdateMessage).toEqual(false);

    expect(temp.getAllFilesHash()).toEqual({
        '.backtrack-stats.json': 'b5302f926313cf6d6c7f269a2ddc0bbc',
        'backtrack.config.js': 'c940bddf3d3e702288435d3d5e4e6918',
        'file1.js': '6ee14b91f6650d0d66df3d6abed83545',
        'files/file1.js': '75ca550e137beb27a115fc2bf7850290',
        'package.json': '624e8f9f0a4bb033c9998d9ecf24b393',
    });
});
