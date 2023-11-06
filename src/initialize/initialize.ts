import path from 'path';
import parentModule from 'parent-module';
import { optionsFile } from '../options-file/options-file';
import { Pkg } from '../pkg/pkg';
import { Lifecycles } from '../types';
import {
	configManager,
	ConfigManager,
	ConfigManagerReturn,
} from '../config-manager/config-manager';

class Initialize {
	backtrackConfig: Lifecycles; // Preset?
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

	configManager(args: ConfigManager): ConfigManagerReturn {
		return configManager.bind(this)(args);
	}
}

export { Initialize };
