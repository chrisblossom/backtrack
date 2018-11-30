import path from 'path';
import { buildPath, sourcePath, rootPath } from '../config/paths';
import { filesPostProcessor } from './files-post-processor';

type Args = {
    value: {
        files?: ReadonlyArray<Object>;
    };
};

function postProcessor({ value }: Args) {
    const makeDirs = [buildPath, sourcePath].map((dir) => {
        return path.relative(rootPath, dir);
    });

    const currentFiles = value.files ? value.files : [];

    const files = filesPostProcessor({
        value: [{ makeDirs }, ...currentFiles],
    });

    return {
        ...value,
        files,
    };
}

export { postProcessor };
