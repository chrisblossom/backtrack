'use strict';

module.exports = (wallaby) => {
    return {
        files: [
            { pattern: '*/**/__sandbox__/**/*', instrument: false },
            { pattern: '*/**/__sandbox__/**/.*', instrument: false },
            { pattern: '.babelrc+(.js|)', instrument: false },
            { pattern: 'tsconfig.json', instrument: false },
            { pattern: 'jest.config.js', instrument: false },
            { pattern: 'jest-babel-transform.js', instrument: false },
            'src/**/*.ts',
            'e2e-tests/**/*.ts',
            '.env',
            '*/**/__snapshots__/*.snap',
            '!src/**/*.test.ts',
            '!e2e-tests/**/*.test.ts',
        ],

        tests: [
            'src/**/*.test.ts',
            // 'e2e-tests/**/*.test.ts',

            // 'src/initialize/initialize.test.js',
            // 'src/pkg/pkg.test.js',

            // 'src/run/run-task.test.js',
            // 'src/run/run.test.js',
            // 'src/options-file/resolve-processor.test.js',
            // 'src/options-file/files-preprocessor.test.js',
            // 'src/options-file/files-validator.test.js',
            // 'src/options-file/files-post-processor.test.js',
            // 'src/options-file/clean-validator.test.js',
            // 'src/options-file/clean-preprocessor.test.js',
            // 'src/options-file/clean-processor.test.js',
            // 'src/options-file/options-file.test.js',
            // 'src/options-file/transform-config.test.js',
            // 'src/options-file/preprocessor.test.js',
            // 'src/options-file/preset-validator.test.js',
            // 'src/options-file/merge-presets.test.js',
            // 'src/options-file/add-defaults.test.js',
            // 'src/options-file/load-options-file.test.js',
            // 'src/cli/start.test.js',
            // 'src/file-manager/parse-copy-files.test.js',
            // 'src/file-manager/remove-stale-files.test.js',
            // 'src/file-manager/remove-stale-directories.test.js',
            // 'src/file-manager/file-manager.test.js',
            // 'src/file-manager/backup-changed-files.test.js',
            // 'src/file-manager/copy-files.test.js',
            // 'src/file-manager/validate-copy-files.test.js',
            // 'src/file-manager/get-file-stats.test.js',
            // 'src/stats-file/load-stats-file.test.js',
            // 'src/stats-file/write-stats-file.test.js',
            // 'src/utils/parse-file-path.test.js',
            // 'src/utils/test-utils.test.js',
            // 'src/utils/get-file-hash.test.js',
            // 'src/utils/backup-file.test.js',
            // 'src/utils/file-is-inside-dir.test.js',
            // 'src/utils/handle-error.test.js',
            // 'src/utils/object-utils.test.ts',
            // 'src/package-json-manager/backup-package-json.test.js',
            // 'src/package-json-manager/should-update.test.js',
            // 'src/package-json-manager/update-package-json.test.js',
            // 'src/package-json-manager/package-json-manager.test.js',
            // 'src/package-json-manager/write-package-json.test.js',
            // 'src/package-json-manager/load-package-json.test.js',
            // 'src/package-json-manager/get-managed-keys.test.js',
            // 'src/clean/*.test.js',
            // 'src/clean/clean.test.js',
            // 'src/config-manager/merge-custom-configs.test.js',
            // 'src/config-manager/config-manager.test.js',
        ],

        compilers: {
            '**/*.ts': wallaby.compilers.babel(),
        },

        hints: {
            ignoreCoverage: /ignore coverage/,
        },

        env: {
            type: 'node',
            runner: 'node',
        },

        testFramework: 'jest',

        setup: (w) => {
            /**
             * https://github.com/wallabyjs/public/issues/1268#issuecomment-323237993
             */
            if (w.projectCacheDir !== process.cwd()) {
                process.chdir(w.projectCacheDir);
            }

            require('@babel/polyfill');
            process.env.NODE_ENV = 'test';
            const jestConfig = require('./jest.config');

            jestConfig.transform = { '__sandbox__.+\\.jsx?$': 'babel-jest' };
            w.testFramework.configure(jestConfig);
        },
    };
};
