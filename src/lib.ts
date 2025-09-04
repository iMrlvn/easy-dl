import { spawn } from "node:child_process";
import { mkdirSync, createWriteStream, existsSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { get } from "node:https";

/**
 * Download a file from a given URL and save it locally.
 *
 * @param url - The remote URL to fetch.
 * @param dest - Local file path to store the binary.
 */
async function downloadFile(url: string, dest: string): Promise<void> {
  mkdirSync(join(process.cwd(), "bin"), { recursive: true }); // buat folder bin jika belum ada
  return new Promise((resolve, reject) => {
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
    }).on("error", err => reject(err));
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
  const { execFile } = await import("node:child_process");
  const { promisify } = await import("node:util");
  const execFileAsync = promisify(execFile);
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

      if (platform === "win32") url = "https://github.com/eugeneware/ffmpeg-static/releases/latest/download/win32-x64.exe";
      else if (platform === "darwin")
        url = arch === "arm64"
          ? "https://github.com/eugeneware/ffmpeg-static/releases/latest/download/darwin-arm64"
          : "https://github.com/eugeneware/ffmpeg-static/releases/latest/download/darwin-x64";
      else
        url = arch === "arm64"
          ? "https://github.com/eugeneware/ffmpeg-static/releases/latest/download/linux-arm64"
          : "https://github.com/eugeneware/ffmpeg-static/releases/latest/download/linux-x64";

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
   * Extra arguments for yt-dlp
   * See here: https://github.com/yt-dlp/yt-dlp?tab=readme-ov-file#usage-and-options
   */
  ytdlpArgs?: string[];

  /**
   * Extra arguments for ffmpeg
   * See here: https://ffmpeg.org/ffmpeg.html#Options
   */
  ffmpegArgs?: string[];
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
export async function download(url: string, options: DownloadOptions = {}): Promise<Buffer | void> {
  if (!url) throw new Error("No URL provided for download");

  const mode = options.mode ?? "audio";
  const format = options.format ?? (mode === "audio" ? "mp3" : "mp4");
  const quality = options.quality ?? (mode === "audio" ? "0" : "best");

  const ytDlp = await ensureBinary("yt-dlp");
  const ffmpeg = await ensureBinary("ffmpeg");

  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    const isBufferMode = !options.output;
    const outputPath = isBufferMode ? "-" : options.output!;

    const ytdlpArgs: string[] = [];

    // Mode setup
    if (mode === "audio") ytdlpArgs.push("-f", quality);
    else ytdlpArgs.push("-f", quality, "--merge-output-format", format);

    ytdlpArgs.push("--quiet", "--no-warnings");
    ytdlpArgs.push("-o", outputPath, url);

    // Append extra yt-dlp args
    if (options.ytdlpArgs?.length) ytdlpArgs.push(...options.ytdlpArgs);

    const ytdlpProc = spawn(ytDlp, ytdlpArgs);

    const ffmpegArgs: string[] = [];
    if (mode === "audio") ffmpegArgs.push("-i", "pipe:0", "-vn", "-f", format, "pipe:1");
    else ffmpegArgs.push("-i", "pipe:0", "-c", "copy", "-f", format, "pipe:1");

    // Append extra ffmpeg args
    if (options.ffmpegArgs?.length) ffmpegArgs.push(...options.ffmpegArgs);

    const ffmpegProc = spawn(ffmpeg, ffmpegArgs);

    // Pipe yt-dlp stdout to ffmpeg stdin
    ytdlpProc.stdout.pipe(ffmpegProc.stdin);

    // Collect output chunks if Buffer mode
    if (isBufferMode) ffmpegProc.stdout.on("data", chunk => chunks.push(chunk));

    // Log yt-dlp errors
    ytdlpProc.stderr.on("data", chunk => console.error("⚠️ [yt-dlp]", chunk.toString()));

    ffmpegProc.on("close", code => {
      if (code !== 0) return reject(new Error(`ffmpeg exited with code ${code}`));
      if (isBufferMode) resolve(Buffer.concat(chunks));
      else resolve(); // file already written
    });

    ytdlpProc.on("close", code => {
      if (code !== 0) console.error("⚠️ [yt-dlp] exited with code", code);
    });
  });
}

export { download as default, download };