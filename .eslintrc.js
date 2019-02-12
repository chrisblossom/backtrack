'use strict';

module.exports = {
    extends: ['@chrisblossom/eslint-config'],
    rules: {
        // https://github.com/benmosher/eslint-plugin-import/issues/1282
        'import/named': 'off',
    },
};
