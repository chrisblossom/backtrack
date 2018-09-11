'use strict';

module.exports = {
    extends: ['@chrisblossom/eslint-config'],
    rules: {
        'import/named': 'off',
    },
    settings: {
        flowtype: {
            onlyFilesWithFlowAnnotation: false,
        },
    },
};
