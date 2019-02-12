'use strict';

const babel = {
    presets: [
        [
            '@babel/env',
            {
                targets: {
                    node: '6.9.0',
                },
                useBuiltIns: 'entry',
            },
        ],
        '@babel/typescript',
    ],
    plugins: [
        '@babel/transform-strict-mode',
        '@babel/proposal-class-properties',
        'dynamic-import-node',
    ],
    overrides: [
        {
            test: ['./src/backtrack.ts'],
            plugins: [
                [
                    'babel-plugin-add-module-exports',
                    { addDefaultProperty: true },
                ],
            ],
        },
    ],
};

module.exports = babel;
