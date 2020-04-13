import Joi from '@hapi/joi';

const disallowed = [
	'name',
	'description',
	'keywords',
	'preferGlobal',

	'repository',
	'bugs',
	'homepage',

	/**
	 * Possibly allow these
	 *
	 * If added and not found, exit and ask to install
	 */
	'bundledDependencies',
	'bundleDependencies',
	'optionalDependencies',
	'peerDependencies',
	'devDependencies',
	'dependencies',
].reduce((acc, key) => {
	return {
		...acc,
		[key]: Joi.any().forbidden().label(`package.json managedKey: ${key}`),
	};
}, {});

const packageJsonSchema = Joi.array()
	.items(Joi.object(disallowed))
	.label('packageJson')
	.single(true)
	.options({
		allowUnknown: true,
	});

export { packageJsonSchema };
