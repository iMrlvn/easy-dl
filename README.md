# easy-dl

[![npm version](https://img.shields.io/npm/v/@mrlvn/easy-dl)](https://www.npmjs.com/package/@mrlvn/easy-dl) [![npm downloads](https://img.shields.io/npm/dm/@mrlvn/easy-dl)](https://www.npmjs.com/package/@mrlvn/easy-dl)

A simple and flexible library downloader for audio and video using [**yt-dlp**](https://github.com/yt-dlp/yt-dlp) and [**ffmpeg**](https://ffmpeg.org).  
Supports both [**Node.js**](https://nodejs.org) and [**Bun**](https://bun.com).

## 📦 Installation
Using NPM
```bash
npm install @mrlvn/easy-dl
```
Using BUN
```bash
bun add @mrlvn/easy-dl
```

## 🚀 Usage
CommonJS
```js
const { download } = require("@mrlvn/easy-dl");
```
ESModule or TypeScript
```ts
import { download } from "@mrlvn/easy-dl";
```

## 📚 Examples
```ts
import { download } from "@mrlvn/easy-dl";
import { writeFileSync } from "node:fs";

(async () => {
    // Example 1: Audio as Buffer (as default no options)
    const audioBuffer = await download("https://youtu.be/dQw4w9WgXcQ");

    // Save the audio buffer to file
    if (audioBuffer) {
        writeFileSync("rickroll.mp3", audioBuffer);
        console.log("Audio buffer saved to rickroll.mp3");
    }

    // Example 2: Video to File
    await download("https://youtu.be/dQw4w9WgXcQ", {
        mode: "video",
        output: "./easy-dl/rickroll.mp4"
    });

    // Example 3: Audio or video with custom ffmpeg args
    await download("https://www.youtube.com/watch?v=dQw4w9WgXcQ", {
        mode: "audio",
        output: "./easy-dl/custom/rickroll.mp3",

        /*
        * -ar = samplerate & -ab = bitrate
        * see more: https://ffmpeg.org/ffmpeg.html#Options
        */
        ffmpegArgs: ["-ar", "48000", "-ab", "320k"] // highest quality
    });

    // Example 4: Video or audio Using cookies
    await download("https://www.youtube.com/watch?v=dQw4w9WgXcQ", {
        mode: "video",
        output: "./easy-dl/verified/rickroll.mp4",

        /*
        * using cookies if needed
        * see more: https://github.com/yt-dlp/yt-dlp/wiki/FAQ#how-do-i-pass-cookies-to-yt-dlp
        */
        ytdlpArgs: ["--cookies", "/path/to/cookies.txt"]
    });
})();
```

## ⚙️ Options (`DownloadOptions`)
| Option       | Type                     | Default   | Description |
|--------------|--------------------------|-----------|-------------|
| `mode`       | `"audio"` \| `"video"`   | `"audio"` | Choose whether to download audio or video. |
| `format`     | `string?`                | auto      | Output format (`mp3`, `mp4`, `flac`, etc). |
| `quality`    | `string?`                | `best`    | Quality setting (e.g. `0`, `1080p`, `best`). |
| `output`     | `string?`                | `undefined` | If provided, saves output to this file. If omitted, returns a `Buffer`. |
| `ytdlpArgs`  | `string[]?`              | `[]`      | Extra arguments to pass to yt-dlp. [See more options.](https://github.com/yt-dlp/yt-dlp?tab=readme-ov-file#usage-and-options) |
| `ffmpegArgs` | `string[]?`              | `[]`      | Extra arguments to pass to ffmpeg. [See more options.](https://ffmpeg.org/ffmpeg.html#Options) |

## 📜 License
This project is licensed under the **MIT License**.  
See the [LICENSE](./LICENSE) file for details.