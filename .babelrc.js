'use strict';

const babel = {
    presets: [
        [
            'env',
            {
                targets: {
                    node: '6.9.0',
                },
                useBuiltIns: true,
            },
        ],
        'flow',
    ],
    plugins: ['dynamic-import-node', 'transform-object-rest-spread'],
};

module.exports = babel;
