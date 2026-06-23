export function writeScanError(error: unknown, stderr: NodeJS.WritableStream = process.stderr): void {
  const message = error instanceof Error ? error.message : String(error);
  stderr.write(`Error: ${message}\n`);
}
