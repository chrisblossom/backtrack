/* eslint-disable arrow-body-style,@typescript-eslint/no-unsafe-member-access,@typescript-eslint/no-unsafe-return,@typescript-eslint/no-unsafe-call */

import { FileManager } from '../types';

const filesPreprocessor = (args: any) =>
	require('../options-file/files-preprocessor').filesPreprocessor(args);
const filesParser = (args: any) =>
	require('../options-file/files-post-processor').filesPostProcessor(args);
const getFileStats = (parsedFiles: any) =>
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
