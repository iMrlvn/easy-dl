# easy-dl

[![npm version](https://img.shields.io/npm/v/@mrlvn/easy-dl)](https://www.npmjs.com/package/@mrlvn/easy-dl) [![npm downloads](https://img.shields.io/npm/dm/@mrlvn/easy-dl)](https://www.npmjs.com/package/@mrlvn/easy-dl)

A simple and flexible library downloader for audio and video using **yt-dlp** and **ffmpeg**.  
Supports both **Node.js** and **Bun**.

## 📦 Installation
Using NPM
```bash
npm install @mrlvn/easy-dl
```
Using BUN
```bash
bun add @mrlvn/easy-dl
```
Using YARN
```bash
yarn add @mrlvn/easy-dl
```
Using PNPM
```bash
pnpm add @mrlvn/easy-dl
```

## 🚀 Usage
CommonJS
```js
const download = require("@mrlvn/easy-dl");
```
ESModule or TypeScript
```ts
import download from "@mrlvn/easy-dl";
```

## 📚 Examples
```ts
import download from "@mrlvn/easy-dl";

(async() => {
    // Example 1: Video as Buffer
    const videoBuffer = await download("https://youtu.be/dQw4w9WgXcQ", { type: "video" });

    // Example 2: Audio to File
    await download("https://youtu.be/dQw4w9WgXcQ", {
        type: "audio",
        output: "rickroll.mp3"
    });

    // Example 3: With Cookies
    await download("https://www.youtube.com/watch?v=dQw4w9WgXcQ", {
        type: "video",
        output: "video.mp4",
        cookies: "./cookies.txt"
    });
})();
```

## ⚙️ Options (`DownloadOptions`)
| Option     | Type                     | Default   | Description |
|------------|--------------------------|-----------|-------------|
| `mode`     | `"audio"` \| `"video"`   | `"audio"` | Choose whether to download audio or video. |
| `format`   | `string?`                | auto      | Output format (`mp3`, `mp4`, `flac`, etc). |
| `quality`  | `string?`                | `best`    | Quality setting (e.g. `320k`, `1080p`, `best`). |
| `output`   | `string?`                | `undefined` | If provided, saves output to this file. If omitted, returns a `Buffer`. |
| `cookies`  | `string?`                | `undefined` | Path to cookies file (Netscape/Chrome format) for authenticated downloads. |

## 📜 License
This project is licensed under the **MIT License**.  
See the [LICENSE](./LICENSE) file for details.