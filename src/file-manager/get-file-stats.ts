import { ParsedFiles, FileManagerStats, DirStats, FileStats } from '../types';

function getFileStats(parsedFiles: ParsedFiles): FileManagerStats {
	const fileHashes = parsedFiles.dest.files.reduce((acc, destFile) => {
		const destFileIndex = parsedFiles.dest.files.indexOf(destFile);

		/**
		 * Use source file's hash to allow for 'allowChanges' option and guard against file system errors
		 *
		 * destHash will equal srcHash because the copy_files task is done prior to stats
		 */
		const srcFile = parsedFiles.src.files[destFileIndex];
		const srcHash = parsedFiles.src.hash[srcFile];

		return {
			...acc,
			[destFile]: srcHash,
		};
	}, {});

	const stats: { directories?: DirStats; files?: FileStats } = {};
	if (Object.keys(fileHashes).length !== 0) {
		stats.files = fileHashes;
	}

	if (parsedFiles.makeDirs.length !== 0) {
		stats.directories = parsedFiles.makeDirs;
	}

	return stats;
}

export { getFileStats };
