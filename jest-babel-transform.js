'use strict';

// eslint-disable-next-line import/no-extraneous-dependencies
const babelJest = require('babel-jest');

const jestBabelTransform = babelJest.createTransformer({
    babelrc: false,
    configFile: require.resolve('./.babelrc.js'),
});

module.exports = jestBabelTransform;
