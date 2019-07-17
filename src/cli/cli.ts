#!/usr/bin/env node

import 'source-map-support/register';
import dotenv from 'dotenv';
import { handleError } from '../utils/handle-error';

dotenv.config();

if (require.main === module && process.argv.length > 2) {
	/**
	 * Setup default NODE_ENV
	 * usage: npm run TASK -- --ENV
	 *
	 * Available options:
	 *  --production (--prod)
	 *  --testing (--test)
	 *  --development (--dev) [default]
	 *
	 * Defaults to development
	 */
	process.env.RUN_MODE = process.argv[2];

	if (
		process.argv.includes('--prod') ||
		process.argv.includes('--production')
	) {
		process.env.NODE_ENV = 'production';
	}

	if (
		process.argv.includes('--dev') ||
		process.argv.includes('--development')
	) {
		process.env.NODE_ENV = 'development';
	}

	if (process.argv.includes('--test')) {
		process.env.NODE_ENV = 'test';
	}

	if (process.env.NODE_ENV === undefined) {
		process.env.NODE_ENV = 'development';
	}

	const taskName =
		process.env.RUN_MODE && typeof process.env.RUN_MODE === 'string'
			? process.env.RUN_MODE
			: 'cli-init';

	const NODE_ENV = process.env.NODE_ENV || 'undefined';
	const logPrefix = `${taskName}:${NODE_ENV}`;

	import('./start')
		.then((module) => {
			const start = module.start;

			return start();
		})
		.catch((error) => {
			/**
			 * Handle error here at last resort. Should never get here.
			 */
			return handleError({
				error,
				logPrefix,
			});
		});
} else {
	const logPrefix = '[backtrack]';

	handleError({
		error: new Error('Task required'),
		logPrefix,
	});
}
