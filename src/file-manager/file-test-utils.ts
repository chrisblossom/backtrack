/* eslint-disable arrow-body-style,@typescript-eslint/no-unsafe-member-access,@typescript-eslint/no-unsafe-return,@typescript-eslint/no-unsafe-call,@typescript-eslint/no-unsafe-assignment,@typescript-eslint/explicit-function-return-type */

import { FileManager, FileManagerStats } from '../types';

const filesPreprocessor = (args: unknown) =>
	require('../options-file/files-preprocessor').filesPreprocessor(args);
const filesParser = (args: unknown) =>
	require('../options-file/files-post-processor').filesPostProcessor(args);
const getFileStats = (parsedFiles: unknown) =>
	require('./get-file-stats').getFileStats(parsedFiles);

function fileStats(previousFiles: FileManager): FileManagerStats {
	const normalize = filesPreprocessor({ value: previousFiles });

	const parsedPreviousFiles = filesParser({ value: normalize });

	const previousStats = getFileStats(parsedPreviousFiles).files;

	return previousStats;
}

interface FileInfo {
	previousStats: FileManagerStats;
	parsedFiles: FileManager;
}

function fileInfo(
	files: FileManager = [],
	previousFiles: FileManager = [],
): FileInfo {
	const previousStats = fileStats(previousFiles);
	const normalize = filesPreprocessor({ value: files });

	const parsedFiles = filesParser({ value: normalize });

	return {
		previousStats,
		parsedFiles,
	};
}

export { fileInfo, fileStats };
