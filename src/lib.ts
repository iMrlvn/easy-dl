import { execFile } from "node:child_process";
import { existsSync, mkdirSync, writeFileSync, unlinkSync, readFileSync, createWriteStream } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { promisify } from "node:util";
import { get } from "node:https";

const execFileAsync = promisify(execFile);

/**
 * Download a file from a given URL and save it locally.
 *
 * @param url - The remote URL to fetch.
 * @param dest - Local file path to store the binary.
 */
async function downloadFile(url: string, dest: string): Promise<void> {
  return new Promise((resolve, reject) => {
    mkdirSync(join(process.cwd(), "bin"), { recursive: true });
    const file = createWriteStream(dest, { mode: 0o755 });
    get(url, response => {
      if (response.statusCode !== 200) {
        reject(new Error(`Download failed: ${response.statusCode}`));
        return;
      }
      response.pipe(file);
      file.on("finish", () => {
        file.close();
        resolve();
      });
    }).on("error", err => {
      reject(err);
    });
  });
}

/**
 * Ensure a binary (yt-dlp or ffmpeg) exists.
 * 1. Checks system PATH.
 * 2. Checks ./bin folder.
 * 3. Auto-downloads if missing.
 *
 * @param name - Binary name: "yt-dlp" | "ffmpeg"
 * @returns Absolute path to the binary executable.
 */
async function ensureBinary(name: "yt-dlp" | "ffmpeg"): Promise<string> {
  const isWin = process.platform === "win32";
  const exe = isWin ? `${name}.exe` : name;

  // 1. Try system PATH
  try {
    const whichCmd = isWin ? "where" : "which";
    await execFileAsync(whichCmd, [exe]);
    return exe;
  } catch (_) {
    // 2. Check local bin
    const local = join(process.cwd(), "bin", exe);
    if (existsSync(local)) return local;

    // 3. Auto-download yt-dlp
    if (name === "yt-dlp") {
      const url = isWin
        ? "https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp.exe"
        : "https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp";
      console.log(`Downloading yt-dlp → ${local}`);
      await downloadFile(url, local);
      return local;
    }

    // 3. Auto-download ffmpeg (from ffmpeg-static mirror)
    if (name === "ffmpeg") {
      const arch = process.arch;
      const platform = process.platform;
      let url: string;

      if (platform === "win32") {
        url =
          "https://github.com/eugeneware/ffmpeg-static/releases/latest/download/win32-x64.exe";
      } else if (platform === "darwin") {
        url =
          arch === "arm64"
            ? "https://github.com/eugeneware/ffmpeg-static/releases/latest/download/darwin-arm64"
            : "https://github.com/eugeneware/ffmpeg-static/releases/latest/download/darwin-x64";
      } else {
        // Linux
        url =
          arch === "arm64"
            ? "https://github.com/eugeneware/ffmpeg-static/releases/latest/download/linux-arm64"
            : "https://github.com/eugeneware/ffmpeg-static/releases/latest/download/linux-x64";
      }

      console.log(`Downloading ffmpeg → ${local}`);
      await downloadFile(url, local);
      return local;
    }

    throw new Error(`${name} binary not found`);
  }
}

/**
 * Options for download function.
 */
export interface DownloadOptions {
  /**
   * Download mode.
   * - `"audio"` → extract and convert audio.
   * - `"video"` → download and merge video.
   *
   * @default "audio"
   */
  mode?: "audio" | "video";

  /**
   * Desired format.
   * Examples: `"mp3"`, `"wav"`, `"flac"` for audio,
   * `"mp4"`, `"mkv"` for video.
   *
   * @default "mp3" for audio, "mp4" for video
   */
  format?: string;

  /**
   * Quality setting.
   * - `"0"` = best audio
   * - `"320k"` = high bitrate mp3
   * - `"best"` = best video
   * - `"1080p"`, `"720p"` for specific video quality
   *
   * @default "0" (audio), "best" (video)
   */
  quality?: string;

  /**
   * Output path.
   * - If omitted → returns a Buffer.
   * - If provided → file is written to disk.
   */
  output?: string;

  /**
   * Optional cookies.
   * - Path to cookies.txt file, or raw cookie string.
   */
  cookies?: string;
}

/**
 * Download media from a given URL.
 *
 * - If `output` is provided → saves file to disk.
 * - If `output` is omitted → returns Buffer.
 *
 * @param url - Media URL (YouTube, SoundCloud, etc.)
 * @param options - Download options
 * @returns Buffer if no output is provided, otherwise void
 */
async function download(
  url: string,
  options: DownloadOptions = {}
): Promise<Buffer | void> {
  const mode = options.mode ?? "audio";
  const format = options.format ?? (mode === "audio" ? "mp3" : "mp4");
  const quality = options.quality ?? (mode === "audio" ? "0" : "best");

  const ytDlp = await ensureBinary("yt-dlp");
  const ffmpeg = await ensureBinary("ffmpeg");

  const args: string[] = [];

  // Mode setup
  if (mode === "audio") {
    args.push("-x", "--audio-format", format, "--audio-quality", quality);
  } else {
    args.push("-f", quality, "--merge-output-format", format);
  }

  // Cookies
  if (options.cookies) {
    if (existsSync(options.cookies)) {
      args.push("--cookies", options.cookies);
    } else {
      const tempFile = join(tmpdir(), `easy-dl-cookies-${Date.now()}.txt`);
      writeFileSync(tempFile, options.cookies, "utf8");
      args.push("--cookies", tempFile);
    }
  }

  // Output
  const output = options.output ?? join(tmpdir(), `easy-dl-%(id)s.%(ext)s`);
  args.push("--quiet", "--no-warnings", "--ffmpeg-location", ffmpeg, "-o", output, url);

  // Execute yt-dlp
  await execFileAsync(ytDlp, args);

  // If returning Buffer
  if (!options.output) {
    const files = require("glob").sync(join(tmpdir(), "easy-dl-*"));
    if (!files.length) throw new Error("No output file produced");
    const filePath = files[0];
    const data = readFileSync(filePath);
    unlinkSync(filePath);
    return data;
  }
}

declare const module: any;
if (typeof module !== "undefined" && module.exports) {
  module.exports = download;
}
export { download as default };