/* @flow */

const env = {
    productionRelease: process.env.PRODUCTION_RELEASE !== 'false',

    development: process.env.NODE_ENV
        ? process.env.NODE_ENV === 'development'
        : true,

    /**
     * HMR enabled by default
     *
     * Always disable HMR in production-like environments
     */
    hmr:
        process.env.RUN_MODE === 'dev' && process.env.HMR !== 'false'
            ? process.env.NODE_ENV !== 'production'
            : false,
};

module.exports = Object.freeze(env);
