/* @flow */

import path from 'path';
import parentModule from 'parent-module';
import { optionsFile } from '../options-file/options-file';
import { Pkg } from '../pkg/pkg';
import type { Lifecycles } from '../types';
import {
    configManager,
    type ConfigManager,
} from '../config-manager/config-manager';

class Initialize {
    config: Lifecycles;
    pkg: *;
    paths: *;
    env: *;

    constructor() {
        const parent = parentModule();
        const parentDirname = path.parse(parent).dir;

        this.config = optionsFile(parentDirname);

        this.pkg = new Pkg(this.config.resolve);

        this.paths = require('../config/paths');
        this.env = require('../config/env');

        (this: any).configManager = this.configManager.bind(this);
    }

    configManager(args: ConfigManager) {
        return configManager.bind(this)(args);
    }
}

export { Initialize };
