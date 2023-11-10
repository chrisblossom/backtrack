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
		typeof process.env.RUN_MODE === 'string' && process.env.RUN_MODE !== ''
			? process.env.RUN_MODE
			: 'cli-init';

	const logPrefix = `${taskName}:${process.env.NODE_ENV}`;

	try {
		const module = await import('./start');
		const start = module.start;

		await start();
	} catch (e: unknown) {
		const error = e as Error;
		/**
		 * Handle error here at last resort. Should never get here.
		 */
		await handleError({
			error,
			logPrefix,
		});
	}
} else {
	const logPrefix = '[backtrack]';

	await handleError({
		error: new Error('Task required'),
		logPrefix,
	});
}
