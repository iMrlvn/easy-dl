# easy-dl

A simple and flexible downloader for audio and video using **yt-dlp** and **ffmpeg**.  
Supports both **Node.js** and **Bun**, with programmatic API and CLI interface.

## 📦 Installation
Using NPM
```bash
npm install easy-dl
```
Using BUN
```bash
bun add easy-dl
```
Using YARN
```bash
yarn add easy-dl
```
Using PNPM
```bash
pnpm add easy-dl
```

## 🚀 Usage
CommonJS
```js
const download = require("easy-dl");
```
ESModule or TypeScript
```ts
import donwload from "easy-dl";
```

## 📚 Examples
### Programmatic
```ts
const download = require("easy-dl");

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

### CLI
```bash
# Audio as file
easy-dl "https://youtu.be/dQw4w9WgXcQ" --mode audio --format mp3 --output song.mp3

# Video as file
easy-dl "https://youtu.be/dQw4w9WgXcQ" --mode video --format mp4 --quality best --output video.mp4

# With cookies
easy-dl "https://youtu.be/dQw4w9WgXcQ" --mode video --cookies ./cookies.txt --output private.mp4
```

## ⚙️ Options
### Programmatic Options (`DownloadOptions`)
| Option     | Type                     | Default   | Description |
|------------|--------------------------|-----------|-------------|
| `mode`     | `"audio"` \| `"video"`   | `"audio"` | Choose whether to download audio or video. |
| `format`   | `string?`                | auto      | Output format (`mp3`, `mp4`, `flac`, etc). |
| `quality`  | `string?`                | `best`    | Quality setting (e.g. `320k`, `1080p`, `best`). |
| `output`   | `string?`                | `undefined` | If provided, saves output to this file. If omitted, returns a `Buffer`. |
| `cookies`  | `string?`                | `undefined` | Path to cookies file (Netscape/Chrome format) for authenticated downloads. |

### CLI Flags
| Flag        | Description |
|-------------|-------------|
| `--mode`    | `"audio"` or `"video"`. Default: `"audio"`. |
| `--format`  | Output format (`mp3`, `mp4`, `flac`, etc). |
| `--quality` | Quality setting (e.g. `320k`, `1080p`, `best`). |
| `--output`  | Path to output file. If omitted, returns a Buffer (printed as raw binary to stdout). |
| `--cookies` | Path to cookies.txt file for yt-dlp authentication. |

## 📜 License
This project is licensed under the **MIT License**.  
See the [LICENSE](./LICENSE) file for details.