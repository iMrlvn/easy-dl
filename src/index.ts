import process from "node:process";
import downloader from "./lib.js";

/**
 * Simple CLI argument parser for easy-dl.
 *
 * Parses the command-line arguments into a URL and options object.
 *
 * Supported flags:
 * - `--mode audio|video`
 * - `--format mp3|mp4|flac|mkv`
 * - `--quality best|320k|1080p`
 * - `--output path`
 * - `--cookies file|string`
 *
 * @param argv - CLI arguments (excluding node/bun and script path).
 * @returns Object with `url` and parsed `opts`.
 */
function parseArgs(argv: string[]): { url: string; opts: any } {
  const args = [...argv];
  const url = args.shift();
  const opts: any = {};

  while (args.length > 0) {
    const flag = args.shift();
    if (!flag) break;

    if (flag === "--mode") opts.mode = args.shift();
    else if (flag === "--format") opts.format = args.shift();
    else if (flag === "--quality") opts.quality = args.shift();
    else if (flag === "--output") opts.output = args.shift();
    else if (flag === "--cookies") opts.cookies = args.shift();
  }

  if (!url) {
    console.error(
      "Usage: easy-dl <url> [--mode audio|video] [--format mp3|mp4] [--quality best|320k] [--output path] [--cookies file|string]"
    );
    process.exit(1);
  }

  return { url, opts };
}

/**
 * CLI entry point for easy-dl.
 *
 * Examples:
 * ```bash
 * # Download audio (mp3) with 320k bitrate
 * easy-dl "https://youtu.be/abc123" --mode audio --format mp3 --quality 320k
 *
 * # Download video (mp4) with cookies
 * easy-dl "https://youtu.be/abc123" --mode video --format mp4 --cookies ./cookies.txt
 * ```
 */
(async () => {
  const argv = process.argv.slice(2);
  const { url, opts } = parseArgs(argv);

  try {
    await downloader(url, opts);
  } catch (err) {
    console.error("❌ Error:", err);
    process.exit(1);
  }
})();