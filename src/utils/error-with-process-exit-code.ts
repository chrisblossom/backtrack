/**
 * Adds exitCode to Error for process.exit(exitCode);
 *
 * https://nodejs.org/api/process.html#processexitcode
 */
class ErrorWithProcessExitCode extends Error {
	public exitCode?: number;

	constructor(message: string, exitCode: number) {
		super(message);

		this.exitCode = exitCode;
		// Set the prototype explicitly for better compatibility across different environments
		Object.setPrototypeOf(this, ErrorWithProcessExitCode.prototype);
	}
}

export { ErrorWithProcessExitCode };
