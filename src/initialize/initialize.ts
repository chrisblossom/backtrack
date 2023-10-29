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
	config: Lifecycles;
	pkg: any;
	paths: any;
	env: any;

	constructor() {
		const parent = parentModule() ?? '';
		const parentDirname = path.parse(parent).dir;

		this.config = optionsFile(parentDirname);

		this.pkg = new Pkg(this.config.resolve);

		this.paths = require('../config/paths');
		this.env = require('../config/env');

		this.configManager = this.configManager.bind(this);
	}

	configManager(args: ConfigManager): ConfigManagerReturn {
		return configManager.bind(this)(args);
	}
}

export { Initialize };
