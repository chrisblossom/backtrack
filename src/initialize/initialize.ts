import path from 'path';
import parentModule from 'parent-module';
import { optionsFile } from '../options-file/options-file';
import { Pkg } from '../pkg/pkg';
import type { Lifecycles } from '../types';
import { configManager } from '../config-manager/config-manager';

class Initialize {
	backtrackConfig: Lifecycles;
	pkg: InstanceType<typeof Pkg>;
	paths: Record<string, string>;
	env: Record<string, string>;

	constructor() {
		const parent = parentModule() ?? '';
		const parentDirname = path.parse(parent).dir;

		this.backtrackConfig = optionsFile(parentDirname);

		this.pkg = new Pkg(this.backtrackConfig.resolve);

		this.paths = require('../config/paths') as typeof this.paths;
		this.env = require('../config/env') as typeof this.env;

		this.configManager = this.configManager.bind(this);
	}

	configManager<T>(args: { config: T; namespace: string }): T {
		return configManager.bind(this)(args) as T;
	}
}

export { Initialize };
