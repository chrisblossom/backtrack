/* @flow */

/* eslint-disable arrow-body-style */

import type { FileManager } from '../types.js';

const filesPreprocessor = (args) =>
    // $FlowIgnore
    require('../options-file/files-preprocessor').filesPreprocessor(args);
const filesParser = (args) =>
    // $FlowIgnore
    require('../options-file/files-post-processor').filesPostProcessor(args);
const getFileStats = (parsedFiles) =>
    require('./get-file-stats').getFileStats(parsedFiles);

function fileStats(previousFiles: FileManager) {
    const normalize = filesPreprocessor({ value: previousFiles });

    const parsedPreviousFiles = filesParser({ value: normalize });

    const previousStats = getFileStats(parsedPreviousFiles).files;

    return previousStats;
}

function fileInfo(files: FileManager = [], previousFiles: FileManager = []) {
    const previousStats = fileStats(previousFiles);
    const normalize = filesPreprocessor({ value: files });

    const parsedFiles = filesParser({ value: normalize });

    return {
        previousStats,
        parsedFiles,
    };
}

export { fileInfo, fileStats };
