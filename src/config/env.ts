const productionRelease = process.env.PRODUCTION_RELEASE !== 'false';

const development = process.env.NODE_ENV
	? process.env.NODE_ENV === 'development'
	: true;

/**
 * HMR enabled by default
 *
 * Always disable HMR in production-like environments
 */
const hmr =
	process.env.RUN_MODE === 'dev' && process.env.HMR !== 'false'
		? process.env.NODE_ENV !== 'production'
		: false;

export { productionRelease, development, hmr };
