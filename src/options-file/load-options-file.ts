import cosmiconfig from 'cosmiconfig';
import { rootPath } from '../config/paths';
import { Preset } from '../types';

type ESModule = {
    __esModule: true;
    default?: Preset;
};

type Result = {
    config: Preset | ESModule;
    filepath: string;
};

function isESModule(obj: any): obj is ESModule {
    return obj.__esModule === true;
}

function transform(result: Result | null) {
    /**
     * Handle missing config file
     *
     * TODO: ask to create default backtrack config file with found presets in package.json
     */
    if (result === null) {
        // eslint-disable-next-line no-throw-literal
        throw {
            message: 'backtrack config not found',
            exitCode: 1,
        };
    }

    let config = result.config;

    /**
     * Handle ES Modules
     */
    if (isESModule(config)) {
        if (config.default) {
            config = config.default;
        } else {
            // eslint-disable-next-line no-throw-literal
            throw {
                message: `${result.filepath} must use default export with ES Modules`,
                exitCode: 1,
            };
        }
    }

    return {
        ...result,
        config,
    };
}

const explorer = cosmiconfig('backtrack', {
    stopDir: rootPath,
    transform,
});

function loadOptionsFile(searchPath: string = rootPath): Preset {
    // @ts-ignore
    const { config } = explorer.searchSync(searchPath);

    return config;
}

export { loadOptionsFile };
