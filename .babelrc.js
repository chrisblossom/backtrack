'use strict';

const babel = {
    presets: [
        [
            '@babel/env',
            {
                targets: {
                    node: '8.9.0',
                },
                useBuiltIns: 'usage',
                corejs: 3,
            },
        ],
        '@babel/typescript',
    ],
    plugins: [
        '@babel/transform-strict-mode',
        '@babel/proposal-class-properties',
        'dynamic-import-node',
    ],
};

module.exports = babel;
